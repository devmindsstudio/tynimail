import { useDebounce } from "use-debounce";

import { Button } from "@/components/ui/button";
import { ChevronLeft, SquarePen, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Label } from "@/components/ui/label";
import SubscriberChart from "./subscriber-chart";
import { CiCirclePlus } from "react-icons/ci";
import { useEffect, useState } from "react";
import { useSubscribers } from "@/hooks/use-subscribers";
import SkeletonSubscriber from "./skelton";
import moment from "moment";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import DetailAddSegmentModel from "./add-segment-model-in-subscriper-detail";

const SingleSubscriberContact = () => {
  const [addSegment, setAddSegment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [visibleSegments, setVisibleSegments] = useState(3);

  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState("");
  const [value] = useDebounce(note, 2000);

  const { GET_SINGLE_SUBSCRIBER, UPDATE_SUBSCRIBER_BY_ID } = useSubscribers();
  const singleSubscriberDetail = GET_SINGLE_SUBSCRIBER(id ?? undefined);
  const { data, isLoading, isError } = singleSubscriberDetail;

const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
    },
  });
  const modelCloseHandler = () => {
    setAddSegment(!addSegment);
  };
  const subscriber = data?.subscriber;
  useEffect(() => {
    if (subscriber) {
      setValue("email", subscriber.email ?? "");
      setValue("first_name", subscriber.first_name ?? "");
      setValue("last_name", subscriber.last_name ?? "");
      setNote(subscriber.notes ?? "");
    }
  }, [subscriber]);

const onSubmit = (values: {
    email: string;
    first_name: string;
    last_name: string;
  }) => {
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
    };

    if (id)
      UPDATE_SUBSCRIBER_BY_ID.mutate(
        {
          subscriber_id: id,
          ...payload,
        },
        {
          onError(error) {
            toast.error(error.message);
          },
          onSuccess(data) {
            toast.success(data.message);
          },
        },
      );
    setIsEditing(false);
  };
  useEffect(() => {
    if (!value) return;
    if (!id) return;

    UPDATE_SUBSCRIBER_BY_ID.mutate(
      {
        subscriber_id: id,
        notes: value,
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        // onSuccess(data) {
        //   toast.success(data.message);
        // },
      },
    );
  }, [value]);

  if (isLoading) {
    return <SkeletonSubscriber />;
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-red-500 text-sm font-medium">
          Failed to load Subscriber
        </p>
        <p className="text-gray-400 text-xs mt-1 mb-4">
          Something went wrong. Please try again.
        </p>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
          Retry
        </button>
      </div>
    );
  }

  const email = watch("email");
  const firstName = watch("first_name");
  const lastName = watch("last_name");

  return (
    <>
      <div className="max-w-tiny-mail mx-auto px-5 sm:px-10 lg:px-20 py-10">
        <div className="content">
          <Button
            variant="outline"
            className="h-10 text-base gap-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="size-5" />
            <span>Back</span>
          </Button>
          {/* <div className="flex justify-start flex-col sm:flex-row items-start sm:items-center mt-3 mb-7 gap-3">
            <h2 className="font-inter font-normal text-xl lg:text-3xl">{subscriber.email}</h2>
            <p className="bg-green-100 text-green-500 font-inter text-sm font-medium py-1 px-4 rounded-3xl inline-block leading-5">
              Active
            </p>
          </div> */}
          <div className=" flex-col lg:flex-row  flex gap-8 justify-between items-stretch mt-10">
            <div className="overview bg-muted p-5 border border-input w-full lg:max-w-175 rounded-[14px]">
              <SubscriberChart metadata={subscriber?.metadata} />
            </div>
            <div className="subscriber p-5 border border-input w-full lg:max-w-137.5 rounded-[14px] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-2xl leading-8 text-foreground">
                  Subscriber Details
                </h2>
                {/* <Button variant="outline" className="h-10">
                  <SquarePen />
                  Edit
                </Button> */}
                {isEditing ? (
                  <Button className="h-10" onClick={handleSubmit(onSubmit)}>
                    Save
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="h-10"
                    onClick={() => setIsEditing(true)}
                  >
                    <SquarePen />
                    Edit
                  </Button>
                )}
              </div>
              <div className="flex flex-col flex-wrap gap-3">
                <div className="flex justify-between md:items-center flex-col md:flex-row gap-3">
                  <div className="">
                    <Label
                      htmlFor=""
                      className="text-muted-foreground font-normal mb-0.5 block"
                    >
                      Email Address
                    </Label>
                    {/* <p className="text-foreground font-medium text-base leading-6">
                      {subscriber.email}
                    </p> */}
                    {isEditing ? (
                      <Input
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+$/,
                            message: "Spaces are not allowed in email",
                          },
                        })}
                      />
                    ) : (
                      <p className="text-foreground font-medium text-base">
                        {email}
                      </p>
                    )}
                    {/* <input type="text" /> */}
                  </div>
                  <div>
                    <Label
                      htmlFor=""
                      className="text-muted-foreground font-normal mb-0.5 block"
                    >
                      Status
                    </Label>
                    {subscriber.status === 1 ? (
                      <p className="bg-green-100 text-green-500 font-inter text-sm font-medium py-1 px-4 rounded-3xl inline-block leading-5">
                        Verified
                      </p>
                    ) : subscriber.is_blocklisted ? (
                      <div className="flex flex-col gap-1">
                        <p className="bg-orange-100 text-orange-600 font-inter text-sm font-medium leading-5 py-1 px-3 rounded-3xl inline-block">
                          Blocklisted
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {subscriber.blocklist_reason?.replace(/_/g, " ")}
                          {subscriber.blocklist_date && ` · ${moment(subscriber.blocklist_date).format("MMM D, YYYY")}`}
                        </p>
                      </div>
                    ) : (
                      <p className="bg-red-100 text-red-500 font-inter text-sm font-medium leading-5 py-1 px-3 rounded-3xl inline-block">
                        Unverified
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <Label
                      htmlFor=""
                      className="text-muted-foreground font-normal mb-0.5 block"
                    >
                      First Name
                    </Label>
                    {isEditing ? (
                      <Input
                        type="text"
                        {...register("first_name", {
                          pattern: {
                            value: /^\S*$/, // allows empty, but no spaces
                            message: "Spaces are not allowed",
                          },
                        })}
                      />
                    ) : (
                      <p className="text-foreground font-medium text-base">
                        {firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor=""
                      className="text-muted-foreground font-normal mb-0.5 block"
                    >
                      Last Name
                    </Label>
                    {/* <p className="text-foreground font-medium text-base leading-6">
                      {subscriber.last_name ?? "N/A"}
                    </p> */}

                    {isEditing ? (
                      <Input
                        type="text"
                        {...register("last_name", {
                          pattern: {
                            value: /^\S*$/, // allows empty, but no spaces
                            message: "Spaces are not allowed",
                          },
                        })}
                      />
                    ) : (
                      <p className="text-foreground font-medium text-base">
                        {lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="">
                <hr className="border border-input" />
              </div>
              <div className="flex flex-col flex-wrap gap-3">
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <Label
                      htmlFor=""
                      className="text-muted-foreground font-normal mb-0.5 block"
                    >
                      Source
                    </Label>
                    <p className="text-foreground font-medium text-base leading-6">
                      {
                        subscriber.source &&
                          subscriber.source
                            ?.replace(/[_-]/g, " ") // replace underscores and hyphens with space
                            .toLowerCase() // optional: make everything lowercase
                            .replace(/\b\w/g, (c: any) => c.toUpperCase()) // optional: capitalize first letter of each word
                      }
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor=""
                      className="text-muted-foreground font-normal mb-0.5 block"
                    >
                      Date Created
                    </Label>
                    <p className="text-foreground font-medium text-base leading-6">
                      {moment(subscriber.created_at).format("MMM D")}
                    </p>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor=""
                    className="text-muted-foreground font-normal mb-0.5 block"
                  >
                    Last Activity
                  </Label>
                  <p className="text-foreground font-medium text-base leading-6">
                    {moment(subscriber.updated_at).format("MMM D [at] h:mma")}
                  </p>
                  {/* <input type="text" /> */}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-col lg:flex-row  flex gap-8 justify-between items-start mt-8">
            <div className="overview bg-muted p-5 border border-input w-full lg:max-w-175 rounded-[14px]">
              <h2 className="font-semibold text-2xl leading-8 text-foreground">
                Activity Timeline
              </h2>
              <div className=" grid gap-2 my-10 sm:my-18.75">
                <div className="mx-auto text-center">
                  <img
                    src="/not-activity.png"
                    className="w-auto max-h-25 sm:max-h-35 mx-auto"
                    alt=""
                  />
                  <p className="font-normal text-2xl text-foreground leading-8 mt-6 mb-2.5">
                    No Activity Recorded
                  </p>
                  <p className="text-sm leading-normal text-muted-foreground">
                    You’ll see events appear here as they’re recorded.
                  </p>
                </div>
              </div>
              {/* <ul className="mt-4 grid gap-2">
                {subscriber.activityTimeline.map((activity, index) => {
                  return (
                    <li
                      key={index}
                      className="bg-background border border-input p-3 gap-3 rounded-xl"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {activity.status === 1 ? (
                            <div className="w-10 h-10 bg-[#FEF2F2] flex justify-center items-center rounded-full text-red-500">
                              <Info size={20} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-[#EFF6FF] flex justify-center items-center rounded-full text-primary">
                              <UserPlus size={20} />
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <h2>{activity.description}</h2>
                            <p className="text-muted-foreground font-normal text-xs leading-4">
                              {activity.date}
                            </p>
                          </div>
                        </div>
                        <p className="text-muted-foreground font-normal text-xs leading-4">
                          {activity.time}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul> */}
            </div>
            <div className="w-full lg:max-w-137.5 flex flex-col gap-8">
              <div className="p-5 border border-input rounded-[14px] flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-2xl leading-8 text-foreground">
                    Segments
                  </h2>
                  <Button
                    variant="outline"
                    className="h-10"
                    onClick={modelCloseHandler}
                  >
                    <CiCirclePlus />
                    Add
                  </Button>
                </div>
                {/* <ul className="grid gap-4">
                  {subscriber?.segments && subscriber.segments.length > 0 ? (
                    subscriber.segments.map((segment: any, index: number) => (
                      <li
                        key={index}
                        className="border border-input rounded-[10px] p-3 flex justify-between items-center gap-2.5"
                      >
                        <div className="flex gap-3 items-center">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          ></div>
                          <h2 className="text-foreground font-normal text-base leading-6">
                            {segment.name}
                          </h2>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No segments available
                    </p>
                  )}
                </ul> */}
                <ul className="grid gap-4 overflow-x-hidden h-auto max-h-[181px]">
                  {subscriber?.segments && subscriber.segments.length > 0 ? (
                    <>
                      {subscriber.segments
                        .slice(0, visibleSegments)
                        .map((segment: any, index: number) => (
                          <li
                            key={index}
                            className="border border-input rounded-[10px] p-3 flex justify-between items-center gap-2.5"
                          >
                            <div className="flex gap-3 items-center">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: segment.color }}
                              ></div>

                              <h2 className="text-foreground font-normal text-base leading-6">
                                {segment.name}
                              </h2>
                            </div>
                          </li>
                        ))}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No segments available
                    </p>
                  )}
                </ul>
                <div className="text-center">
                  {subscriber.segments.length > visibleSegments && (
                    <button
                      onClick={() => setVisibleSegments((prev) => prev + 3)}
                      className="text-foreground font-medium text-lg leading-6"
                    >
                      Load More
                    </button>
                  )}
                </div>
              </div>
              <div className="p-5 border border-input rounded-[14px] flex flex-col gap-2">
                <p className="text-muted-foreground font-normal text-sm leading-5">
                  Private Notes
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this subscriber..."
                  className="leading-5 bg-muted  text-sm p-3 text-muted-foreground rounded-lg h-31 outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {addSegment && (
        <DetailAddSegmentModel
          subscriberId={[id]}
          allSegmentApi={false}
          modelCloseHandler={modelCloseHandler}
        />
      )}
    </>
  );
};

export default SingleSubscriberContact;
