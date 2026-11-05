import { cx } from "@/shared/utils/cx";
import { radioGroup } from "./RadioGroup.style";
import type { IRadioGroupProps } from "./RadioGroup.type";
import { useRadioGroup } from "./useRadioGroup";

/** Native radios as a plain list or as cards; a card's `panel` shows only while it is selected. */
export function RadioGroup<TValue extends string>({
  legend,
  legendHidden = false,
  name,
  value,
  onChange,
  appearance = "list",
  options,
  className,
}: IRadioGroupProps<TValue>) {
  const { items } = useRadioGroup({ value, onChange, options });
  const look = radioGroup.appearance[appearance];

  return (
    <fieldset className={cx(radioGroup.base, className)}>
      <legend
        className={cx(
          radioGroup.legend,
          legendHidden ? radioGroup.legendHidden : radioGroup.legendVisible,
        )}
      >
        {legend}
      </legend>
      <div className={cx(radioGroup.list, look.list)}>
        {items.map((item) => (
          <div key={item.inputId} className={item.checked ? look.frameChecked : look.frame}>
            <label
              htmlFor={item.inputId}
              className={cx(radioGroup.label, item.checked ? look.labelChecked : look.label)}
            >
              <input
                id={item.inputId}
                type="radio"
                name={name}
                value={item.value}
                checked={item.checked}
                onChange={item.onSelect}
                className={radioGroup.radio}
              />
              <span className={radioGroup.text}>
                <span>{item.label}</span>
                {item.description && (
                  <span className={radioGroup.description}>{item.description}</span>
                )}
              </span>
              {item.badge && <span className={radioGroup.badge}>{item.badge}</span>}
              {item.trailing && <span className={radioGroup.trailing}>{item.trailing}</span>}
            </label>
            {item.checked && item.panel && <div className={look.panel}>{item.panel}</div>}
          </div>
        ))}
      </div>
    </fieldset>
  );
}
