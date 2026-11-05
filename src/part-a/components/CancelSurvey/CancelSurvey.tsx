import { subscriptionContent } from "@/content/subscription";
import { Button } from "@/shared/components/Button/Button";
import { RadioGroup } from "@/shared/components/RadioGroup/RadioGroup";
import { cancelSurvey } from "./CancelSurvey.style";
import type { ICancelSurveyViewProps, TCancelReason } from "./CancelSurvey.type";

export function CancelSurvey({
  title,
  lead,
  h1Ref,
  value,
  options,
  onChange,
  sendDisabled,
  onSend,
  onSkip,
}: ICancelSurveyViewProps) {
  return (
    <div className={cancelSurvey.page}>
      <h1 ref={h1Ref} tabIndex={-1} className={cancelSurvey.title}>
        {title}
      </h1>
      <p className={cancelSurvey.lead}>{lead}</p>
      <RadioGroup<TCancelReason | "">
        legend={subscriptionContent.survey.legend}
        name="cancel-reason"
        className={cancelSurvey.options}
        appearance="list"
        value={value}
        options={options}
        onChange={(choice) => choice && onChange(choice)}
      />
      <div className={cancelSurvey.actions}>
        <Button size="lg" fullWidth disabled={sendDisabled} onClick={onSend}>
          {subscriptionContent.survey.send}
        </Button>
        <Button variant="quiet" size="lg" fullWidth onClick={onSkip}>
          {subscriptionContent.survey.skip}
        </Button>
      </div>
    </div>
  );
}
