import { useParams } from "react-router";
import FormSurveyBuilder from ".";
import { useForms } from "@/hooks/use-forms";
import FormSurveyBuilderSkeleton from "../skeleton";

const FormSurveyBuilderUpdate = () => {
  const { formsbuilderId } = useParams<{ formsbuilderId: string }>();
  const { GET_FROM_BY_ID } = useForms();
  const { data, isLoading, isError, error } = GET_FROM_BY_ID(
    formsbuilderId ?? "",
  );

  const formData = data?.form;

  if (isLoading) {
    return <FormSurveyBuilderSkeleton />;
  }
  if (isError) {
    return <p>{error.message}</p>;
  }

  if (!formData) {
    return <FormSurveyBuilderSkeleton />;
  }

  const contentData = formData?.content ?? {};

  const json = contentData ? JSON.parse(contentData) : null;

  return (
    <div className="update">
      <FormSurveyBuilder fromSuvryId={formData.id} updated={true} data={json} />
    </div>
  );
};

export default FormSurveyBuilderUpdate;
