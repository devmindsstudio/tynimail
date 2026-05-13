import { useEffect, useState } from "react";
import ModelLayout from "../model/model-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { FiTrash2 } from "react-icons/fi";
import { SegMentAndButton } from "./add-segment-cancel-add-buttons";
import { Controller, useForm } from "react-hook-form";
import { useSubscribers } from "@/hooks/use-subscribers";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
const AddSubsciberModel = ({
  modelCloseHandler,
  segmentId = null,
}: {
  modelCloseHandler: () => void;
  segmentId?: any;
}) => {
  type FormValues = {
    email: string;
    segment: [any];
    first_name?: string;
    last_name?: string;
    file?: File;
  };
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const { ADD_SINGLE_SUBSCRIBER, UPLOAD_CSV_BY_ID_SEGMENT } = useSubscribers();

  const queryClient = useQueryClient();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setValue("file", acceptedFiles[0], { shouldValidate: true });
      }
    },
  });

  const [selectType, setSelectType] = useState<"individual" | "csv">(
    "individual",
  );

  const typesdata = [
    {
      id: "individual",
      name: "Add as Individual",
    },
    {
      id: "csv",
      name: "Upload as CSV",
    },
  ];
  const onSubmit = (data: FormValues) => {
    if (selectType === "csv") {
      if (data.file) {
        UPLOAD_CSV_BY_ID_SEGMENT.mutate(
          {
            file: data.file,
            segmentId: segmentId
              ? segmentId
              : data.segment
                ? data.segment.join(",")
                : null,
          },
          {
            onError(error: any) {
              toast.error(error.message);
            },
            onSuccess(response: any) {
              console.log("response", response);
              toast.success(response.message);
              reset();
              queryClient.invalidateQueries({
                queryKey: ["GET_ALL_SEGMENTS"],
              });

              queryClient.invalidateQueries({
                queryKey: ["GET_ALL_SUBSCRIBERS"],
              });
              modelCloseHandler();
            },
          },
        );
      }
    } else {
      ADD_SINGLE_SUBSCRIBER.mutate(
        {
          segments_ids: (segmentId ? [segmentId] : data.segment) as any[],
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
        },
        {
          onError(error) {
            toast.error(error.message);
          },
          onSuccess(data) {
            console.log("response", data);

            toast.success(data.message);
            reset();

            // SINGLE_SEGMENT_ID_SUB
            modelCloseHandler();
            queryClient.invalidateQueries({
              queryKey: ["GET_ALL_SEGMENTS"],
            });

            queryClient.invalidateQueries({
              queryKey: ["GET_ALL_SUBSCRIBERS"],
            });
          },
        },
      );
    }
  };

  useEffect(() => {
    if (segmentId) {
      setValue("segment", [segmentId]);
    }
  }, [segmentId]);

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <ModelLayout>
      <div className="p-4 w-full mx-auto max-w-113">
        <div className="w-full  bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <h2 className="text-2xl font-semibold font-inter leading-8 text-foreground">
            Subscriber Detail
          </h2>
          <p className="text-sm font-normal text-muted-foreground font-sans mt-2">
            Fill in the details below to add a new subscriber.{" "}
          </p>
          <div className="my-4">
            <ul className="grid grid-cols-2 p-1 bg-muted rounded-[6px]">
              {typesdata.map((type: any, index: number) => {
                return (
                  <li
                    onClick={() => {
                      reset();
                      setSelectType(type.id);
                    }}
                    key={index}
                    className={`cursor-pointer p-1.5 font-medium text-sm leading-5 text-center rounded ${type.id === selectType ? "bg-primary text-primary-foreground " : "text-foreground"}`}
                  >
                    {type.name}
                  </li>
                );
              })}
            </ul>
          </div>
          {selectType === "csv" ? (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="file"
                control={control}
                rules={{
                  required: "CSV file is required",
                }}
                render={({ field, fieldState }) => (
                  <>
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />

                      <div
                        className={`text-center p-4 rounded-md border border-border cursor-pointer transition ${
                          isDragActive
                            ? "border-primary bg-muted"
                            : "border-input"
                        }`}
                      >
                        <Upload className="text-muted-foreground mx-auto" />
                        <p className="text-foreground text-sm leading-5 font-medium mt-3 ">
                          Drop your CSV file here
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 mb-1">
                          or click to browse from your computer <br />
                          Download{" "}
                          <a
                            href="/sample-subscriber.csv"
                            download
                            className="underline cursor-pointer"
                          >
                            Sample file
                          </a>
                        </p>
                        <p className="text-muted-foreground font-normal text-sm">
                          Max file size 5MB
                        </p>
                      </div>
                    </div>

                    {fieldState.error && (
                      <p className="text-red-500 text-sm">
                        {fieldState.error.message}
                      </p>
                    )}

                    {/* Uploaded File Preview */}
                    {field.value && (
                      <div className="mt-4 border border-input flex justify-between items-center rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src="/file-xls.png"
                            alt="file"
                            className="w-10 h-10 object-contain"
                          />

                          <div>
                            <h2 className="text-sm font-semibold text-gray-700">
                              {field.value.name}
                            </h2>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              {formatFileSize(field.value.size)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => field.onChange(undefined)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              />
              <SegMentAndButton
                control={control}
                errors={errors}
                modelCloseHandler={modelCloseHandler}
                segmentId={segmentId}
                disabled={UPLOAD_CSV_BY_ID_SEGMENT.status === "pending"}
              />
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="">
                <Label htmlFor="email" className="mb-1.5">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                  })}
                  placeholder="E.g jhon.doe@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="">
                  <Label htmlFor="firstName" className="mb-1.5">
                    First Name
                  </Label>
                  <Input
                    type="text"
                    id="firstName"
                    {...register("first_name", {
                      pattern: {
                        value: /^\S*$/, // allows empty, but no spaces
                        message: "Spaces are not allowed",
                      },
                    })}
                    placeholder="E.g Jhon"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="">
                  <Label htmlFor="lastName" className="mb-1.5">
                    Last Name
                  </Label>
                  <Input
                    type="text"
                    id="lastName"
                    {...register("last_name", {
                      pattern: {
                        value: /^\S*$/, // allows empty, but no spaces
                        message: "Spaces are not allowed",
                      },
                    })}
                    placeholder="E.g Doe"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>
              <SegMentAndButton
                control={control}
                errors={errors}
                segmentId={segmentId}
                modelCloseHandler={modelCloseHandler}
                disabled={ADD_SINGLE_SUBSCRIBER.status === "pending"}
              />
            </form>
          )}
        </div>
      </div>
    </ModelLayout>
  );
};

export default AddSubsciberModel;
