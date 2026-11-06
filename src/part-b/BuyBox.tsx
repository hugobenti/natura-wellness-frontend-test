import { buyBoxContent } from "@/content/buyBox";
import { Icon } from "@/shared/icons/Icon";
import { buyBox } from "./BuyBox.style";
import { copy } from "./copy";
import { FrequencySelect } from "./components/FrequencySelect/FrequencySelect";
import { OptionPrice } from "./components/OptionPrice/OptionPrice";
import { ProductMedia } from "./components/ProductMedia/ProductMedia";
import { PurchaseOption } from "./components/PurchaseOption/PurchaseOption";
import { QuantityBox } from "./components/QuantityBox/QuantityBox";
import { RatingSummary } from "./components/RatingSummary/RatingSummary";
import { useBuyBox } from "./useBuyBox";

export function BuyBox() {
  const {
    option,
    selectOption,
    frequency,
    onFrequencyChange,
    quantity,
    setQuantity,
    addToCartPrice,
    renewal,
  } = useBuyBox();

  return (
    <div className={buyBox.page}>
      <ProductMedia alt={buyBoxContent.imageAlt} />
      <div className={buyBox.info}>
        <p className={buyBox.eyebrow}>{copy.eyebrow}</p>
        <div className={buyBox.rating}>
          <RatingSummary
            rating={copy.rating}
            ratingLabel={buyBoxContent.ratingLabel(copy.rating)}
            reviewCount={copy.reviewCount}
          />
        </div>
        <h1 className={buyBox.title}>{copy.title}</h1>
        <p className={buyBox.subtitle}>{copy.subtitle}</p>
        <hr className={buyBox.divider} />

        <fieldset className={buyBox.options}>
          <legend className={buyBox.legend}>{buyBoxContent.purchaseLegend}</legend>
          <PurchaseOption
            name="purchase-option"
            checked={option === "oneTime"}
            onSelect={() => selectOption("oneTime")}
            label={copy.oneTime.label}
            price={<OptionPrice amountCents={copy.oneTime.priceCents} />}
          />
          <PurchaseOption
            name="purchase-option"
            checked={option === "subscribe"}
            onSelect={() => selectOption("subscribe")}
            label={copy.subscribe.label}
            badge={copy.subscribe.badge}
            price={
              <OptionPrice
                amountCents={copy.subscribe.priceCents}
                compareAtCents={copy.subscribe.comparePriceCents}
              />
            }
          >
            <FrequencySelect
              label={copy.subscribe.frequencyLabel}
              value={frequency}
              options={copy.subscribe.frequencyOptions}
              onChange={onFrequencyChange}
            />
            <ul className={buyBox.perks}>
              {copy.subscribe.perks.map((perk) => (
                <li key={perk} className={buyBox.perk}>
                  <Icon name="check" className={buyBox.perkIcon} />
                  {perk}
                </li>
              ))}
            </ul>
          </PurchaseOption>
        </fieldset>

        <div className={buyBox.purchase}>
          <QuantityBox
            value={quantity}
            onChange={setQuantity}
            label={buyBoxContent.quantityLabel}
          />
          <button type="button" className={buyBox.addToCart}>
            {copy.addToCart}
            <span aria-hidden="true">{buyBoxContent.addToCartSeparator}</span>
            {addToCartPrice}
          </button>
        </div>

        <ul className={buyBox.trust}>
          {copy.trust.map((item) => (
            <li key={item} className={buyBox.trustItem}>
              <Icon name="check-circle" className={buyBox.trustIcon} />
              {item}
            </li>
          ))}
        </ul>
        <div aria-live="polite">{renewal && <p className={buyBox.finePrint}>{renewal}</p>}</div>
      </div>
    </div>
  );
}
