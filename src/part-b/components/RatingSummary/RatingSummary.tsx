import { Icon } from "@/shared/icons/Icon";
import { starKeys } from "./RatingSummary.data";
import { ratingSummary } from "./RatingSummary.style";
import type { IRatingSummaryProps } from "./RatingSummary.type";

/** Five solid stars with the score and a link-styled review count. */
export function RatingSummary({ rating, ratingLabel, reviewCount }: IRatingSummaryProps) {
  return (
    <div className={ratingSummary.row}>
      <span role="img" aria-label={ratingLabel} className={ratingSummary.stars}>
        {starKeys.map((key) => (
          <Icon key={key} name="star" filled />
        ))}
      </span>
      <span className={ratingSummary.rating}>{rating}</span>
      <button type="button" className={ratingSummary.reviews}>
        {reviewCount}
      </button>
    </div>
  );
}
