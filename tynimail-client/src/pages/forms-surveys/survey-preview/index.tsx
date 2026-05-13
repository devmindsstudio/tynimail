import { useMemo, useState } from "react";
import { Survey } from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/survey-core.css";
import toast from "react-hot-toast";
import { useForms } from "@/hooks/use-forms";
import { useNavigate, useParams } from "react-router";
import FormSurveyBuilderSkeleton from "../skeleton";
import "./style.css";

const SurveyPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { GET_FROM_BY_ID_FOR_ANAYLATICS, SUBMIT_RESPONSE } = useForms();
  const { data, isLoading, error } = GET_FROM_BY_ID_FOR_ANAYLATICS(id ?? "");

  const formData = data?.form;
  const [submitted, setSubmitted] = useState(false);

  const survey = useMemo(() => {
    if (!formData?.content) return null;

    try {
      const parsedJson = JSON.parse(formData.content);
      const model = new Model(parsedJson.content);
      model.applyTheme(parsedJson.css);

      model.onComplete.add((sender) => {
        const result = sender.data;

        if (id)
          SUBMIT_RESPONSE.mutate(
            {
              formId: id,
              content: result,
            },
            {
              onError(error) {
                toast.error(error.message);
              },
              onSuccess(data) {
                toast.success(data.message);

                model.showCompletedPage = true;

                setTimeout(() => {
                  model.showCompletedPage = false;
                }, 5000);

                setSubmitted(true);
                navigate("/");
              },
            },
          );
      });

      return model;
    } catch (err) {
      return null;
    }
  }, [formData]);

  if (isLoading) return <FormSurveyBuilderSkeleton />;
  if (!survey) return <p>{error?.message}</p>;

  return (
    <div>
      {submitted ? (
        <div className="p-5">
          <h2>Thank You Page 🎉</h2>
        </div>
      ) : (
        <Survey model={survey} />
      )}
    </div>
  );
};

export default SurveyPreview;
