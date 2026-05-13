import { CurrentUser } from '@/decorators';
import { AuthGuard } from '@/guards';
import { success } from '@/responses';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from '@/dto/request/notes';
import {
  CreateNoteBadRequestDto,
  CreateNoteSuccessDto,
  GetNoteSuccessDto,
  UpdateNoteBadRequestDto,
  UpdateNoteSuccessDto,
  DeleteNoteBadRequestDto,
  DeleteNoteSuccessDto,
  GetNoteNotFoundDto,
} from '@/dto/response/notes';
import { isDateInFuture } from '@/utils/time-validator.utils';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Fetch user's note",
    description: 'Fetches all notes for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Note(s) fetched successfully',
    type: GetNoteSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getAllUserNotes(@CurrentUser('sub') userId: string) {
    const data = await this.notesService.getUserNotes(userId);
    return success('Note(s) fetched successfully', { data });
  }

  @Get(':date')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'date',
    description: 'ISO 8601 standard date-only format',
    type: String,
    example: '2026-03-10',
  })
  @ApiOperation({
    summary: "Fetch user's note from a specific date",
    description:
      'Fetches all notes for the authenticated user for the given date',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Note(s) fetched successfully',
    type: GetNoteSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No notes found from the given date',
    type: GetNoteNotFoundDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getAllUserNotesOfAGivenDate(
    @CurrentUser('sub') userId: string,
    @Param('date') givenDate: string,
  ) {
    const data: Array<object> = await this.notesService.getUserNotesOfASpecificData(userId, givenDate);

    if (data.length === 0) {
      throw new NotFoundException('No notes found from the given date');
    } else {
      return success('Note(s) fetched successfully', { data });
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateNoteDto })
  @ApiOperation({
    summary: 'Create a new note',
    description: 'Creates a new form for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Note created successfully',
    type: CreateNoteSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid note or validation error',
    type: CreateNoteBadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async createNote(
    @CurrentUser('sub') userId: string,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    if (isDateInFuture(createNoteDto.date) === false) {
      throw new BadRequestException('Date must not be in the past.');
    }

    const data = await this.notesService.createNewNote(
      userId,
      createNoteDto.title,
      createNoteDto.content,
      createNoteDto.date,
    );
    return success('Note created successfully', { data });
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a note',
    description:
      'Update an existing note (only user-owned notes can be updated)',
  })
  @ApiParam({
    name: 'id',
    description: 'Note ID',
    type: String,
  })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Note updated successfully',
    type: UpdateNoteSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid noteId or validation error',
    type: UpdateNoteBadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async updateNote(
    @CurrentUser('sub') userId: string,
    @Param('id') noteId: string,
    @Body() updateCampaignDto: CreateNoteDto,
  ) {
    if (isDateInFuture(updateCampaignDto.date) === false) {
      throw new BadRequestException('Date must not be in the past.');
    }

    const isNoteFromPast = await this.notesService.isExistingNoteFromPast(noteId, userId);

    if (isNoteFromPast === true)
      throw new BadRequestException(
        'Not allowed to edit a note that is in the past.',
      );

    const data = await this.notesService.updateExistingNote(noteId, userId, {
      title: updateCampaignDto.title,
      content: updateCampaignDto.content,
      date: updateCampaignDto.date,
    });

    if (!data) {
      throw new BadRequestException('Invalid noteId or validation error');
    }

    return success('Note updated successfully', { data });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a note',
    description:
      'Delete an existing note (only user-owned notes can be deleted)',
  })
  @ApiParam({
    name: 'id',
    description: 'Note ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Note deleted successfully',
    type: DeleteNoteSuccessDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Invalid noteId or validation error',
    type: DeleteNoteBadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async deleteNote(
    @CurrentUser('sub') userId: string,
    @Param('id') noteId: string,
  ) {
    const data = await this.notesService.deleteExistingNote(noteId, userId);

    if (!data)
      throw new BadRequestException('Invalid noteId or validation error');

    return success('Note deleted successfully', { data });
  }
}
