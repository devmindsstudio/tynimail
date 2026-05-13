import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  Res,
  Param,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { PageViewService } from './page-view.service';
import { TrackEventService } from './track-event.service';
import { IdentifyService } from './identify.service';
import { ClickProcessingService } from './click-processing.service';
import type { ClickPayload } from './click-processing.service';

// UUID v4 regex — used to validate siteId before embedding in JS output
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@ApiTags('Tracking')
@Controller('t')
export class TrackingController {
  constructor(
    private readonly pageViewService: PageViewService,
    private readonly trackEventService: TrackEventService,
    private readonly identifyService: IdentifyService,
    private readonly clickProcessingService: ClickProcessingService,
  ) {}

  /**
   * Serve the JS tracker snippet with siteId baked in.
   * Called by the customer's browser when they load the <script> tag.
   * No auth required. Cached for 1 hour.
   */
  @Get('js')
  @ApiOperation({
    summary: 'Serve TyniMail JS tracker',
    description:
      'Returns a JavaScript file with the siteId baked in. No authentication required.',
  })
  async serveTracker(
    @Query('siteId') siteId: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!siteId || !UUID_RE.test(siteId)) {
      res.status(400).send('// Invalid siteId');
      return;
    }

    // Fetch element_tracking_enabled for this siteId — bake it into the JS
    const user = await this.pageViewService.getUserBySiteId(siteId);
    const elementTrackingEnabled: boolean =
      user?.element_tracking_enabled === true;

    const baseUrl = process.env.APP_URL ?? '';
    const eventEndpoint = `${baseUrl}/t/e`;
    const pageEndpoint = `${baseUrl}/t/w`;
    const identifyEndpoint = `${baseUrl}/t/identify`;
    const clickEndpoint = `${baseUrl}/t/click`;

    const script = `(function(){
  var siteId="${siteId}";
  var LS_CONTACT_KEY="tm_cid_"+siteId;
  var LS_VISITOR_KEY="tm_vid_"+siteId;
  var LS_EMAIL_KEY="tm_email_"+siteId;

  /* ── visitor ID (anonymous, persistent) ── */
  function getVisitorId(){
    var vid=localStorage.getItem(LS_VISITOR_KEY);
    if(!vid){vid="v-"+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem(LS_VISITOR_KEY,vid);}
    return vid;
  }

  /* ── contact ID (set after identify()) ── */
  function getContactId(){return localStorage.getItem(LS_CONTACT_KEY)||undefined;}
  function setContactId(cid){if(cid)localStorage.setItem(LS_CONTACT_KEY,cid);}

  /* ── email (set on identify, sent with every page view) ── */
  function getEmail(){return localStorage.getItem(LS_EMAIL_KEY)||undefined;}
  function setEmail(e){if(e)localStorage.setItem(LS_EMAIL_KEY,e.toLowerCase().trim());}

  /* ── generic POST helper ── */
  function post(url,payload){
    try{
      if(typeof fetch!=="undefined"){
        return fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),keepalive:true});
      }else{
        var xhr=new XMLHttpRequest();xhr.open("POST",url,true);
        xhr.setRequestHeader("Content-Type","application/json");xhr.send(JSON.stringify(payload));
      }
    }catch(e){}
  }

  /* ── auto page view ── */
  function trackPage(){
    post("${pageEndpoint}",{
      siteId:siteId,
      visitorId:getVisitorId(),
      contactId:getContactId(),
      email:getEmail(),
      url:window.location.href,
      path:window.location.pathname,
      title:document.title||undefined,
      referrer:document.referrer||undefined
    });
  }

  /* ── element click tracking ── */
  ${
    elementTrackingEnabled
      ? `(function(){
    var lastClick={el:null,time:0};
    function getAttrs(el){
      var a={};
      for(var i=0;i<el.attributes.length;i++){
        var attr=el.attributes[i];
        if(attr.name.indexOf("data-")===0)a[attr.name]=attr.value;
      }
      return a;
    }
    document.addEventListener("click",function(e){
      var el=e.target;
      if(!el||el===document.body||el===document.documentElement)return;
      var now=Date.now();
      /* client-side deduplication — ignore same element within 500ms */
      if(lastClick.el===el&&now-lastClick.time<500)return;
      lastClick={el:el,time:now};
      post("${clickEndpoint}",{
        siteId:siteId,
        visitorId:getVisitorId(),
        email:getEmail(),
        tag:el.tagName||undefined,
        id:el.id||undefined,
        classes:el.className?el.className.split(" ").filter(Boolean):[],
        text:(el.innerText||"").trim().slice(0,200)||undefined,
        href:el.href||undefined,
        attrs:getAttrs(el),
        path:window.location.pathname,
        url:window.location.href
      });
    },true);
  })();`
      : '/* element tracking disabled */'
  }

  var queue=(window.TyniMail&&window.TyniMail._q)?window.TyniMail._q:[];
  window.TyniMail={
    /* track(eventName, properties, eventData) */
    push:function(args){
      if(!Array.isArray(args))return;
      var cmd=args[0];
      if(cmd!=="track")return;
      var eventName=args[1]||"";
      var properties=args[2]||{};
      var eventData=args[3]||{};
      if(!eventName)return;
      post("${eventEndpoint}",{siteId:siteId,event_name:eventName,properties:properties,event_data:eventData});
    },
    /* identify(email) — links browser session to a known contact */
    identify:function(email){
      if(!email)return;
      setEmail(email);
      var p=post("${identifyEndpoint}",{siteId:siteId,email:email});
      if(p&&typeof p.then==="function"){
        p.then(function(r){return r.json();}).then(function(d){
          if(d&&d.contactId){setContactId(d.contactId);}
        }).catch(function(){});
      }
    }
  };

  for(var i=0;i<queue.length;i++){window.TyniMail.push(queue[i]);}
  trackPage();
})();`;

    res
      .header('Content-Type', 'application/javascript; charset=utf-8')
      .header('Cache-Control', 'public, max-age=3600')
      .status(200)
      .send(script);
  }

  /**
   * Public custom event tracking endpoint — called by the JS tracker on customer websites.
   * No auth required. Returns 204 immediately; processing is async (fire-and-forget).
   */
  @Post('e')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Track a custom event',
    description:
      'Public endpoint called by the TyniMail JS tracker. No authentication required.',
  })
  async trackEvent(
    @Body()
    body: {
      siteId: string;
      event_name: string;
      properties?: Record<string, any>;
      event_data?: Record<string, any>;
    },
    @Res() res: Response,
  ): Promise<void> {
    res.status(204).send();
    this.trackEventService.trackEvent(body).catch(() => {});
  }

  /**
   * Public webpage visit tracking endpoint — called by the JS snippet on the customer's website.
   * No auth required. Returns 204 immediately; processing is async (fire-and-forget).
   */
  @Post('w')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Track a webpage visit',
    description:
      'Public endpoint called by the TyniMail tracking snippet. No authentication required.',
  })
  async trackWebpage(
    @Body()
    body: {
      siteId: string;
      visitorId: string;
      contactId?: string;
      email?: string;
      url: string;
      path: string;
      title?: string;
      referrer?: string;
    },
    @Res() res: Response,
  ): Promise<void> {
    res.status(204).send();
    this.pageViewService.trackPageView(body).catch(() => {});
  }

  /**
   * Identify a visitor by email address.
   * Called by the JS tracker when the customer calls tynimail.identify(email).
   * Returns the contactId so the tracker can persist it in localStorage.
   */
  @Post('identify')
  @ApiOperation({
    summary: 'Identify a visitor by email',
    description:
      'Resolves an email address to a contactId for the given siteId. No authentication required.',
  })
  async identify(
    @Body() body: { siteId: string; email: string },
  ): Promise<{ contactId: string | null }> {
    return this.identifyService.identify(body);
  }

  /**
   * Public element click tracking endpoint — called by the JS tracker on customer websites.
   * No auth required. Returns 204 immediately; processing is async (fire-and-forget).
   */
  @Post('click')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Track an element click',
    description:
      'Public endpoint called by the TyniMail JS tracker. Evaluates element rules and fires matching custom events. No authentication required.',
  })
  async trackClick(
    @Body() body: ClickPayload,
    @Res() res: Response,
  ): Promise<void> {
    res.status(204).send();
    this.clickProcessingService.processClick(body).catch(() => {});
  }

  /**
   * Public element page session tracking endpoint — called manually by the frontend.
   * No auth required. Returns 204 immediately; processing is async (fire-and-forget).
   */
  @Get('page-session/:id/:duration')
  @HttpCode(204)
  @ApiParam({
    name: 'id',
    description: 'Page ID',
    type: String,
  })
  @ApiParam({
    name: 'duration',
    description: 'Page session duration (seconds)',
    type: Number,
  })
  @ApiOperation({
    summary: 'Track a page session',
    description:
      'Saves a session duration for a page using its id. No authentication required.',
  })
  async pageSession(
    @Param('id') pageId: string,
    @Param('duration') sessionDuration: number,
    @Res() res: Response,
  ): Promise<void> {
    res.status(204).send();
    await this.pageViewService
      .savePageSession(pageId, sessionDuration)
      .catch(() => {});
  }
}
