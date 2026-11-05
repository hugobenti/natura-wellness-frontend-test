import type { Meta, StoryObj } from "@storybook/react-vite";
import css from "@/styles/globals.css?raw";
import { foundationsContent } from "@/content/foundations";
import { readTypeScale } from "@/styles/themeTokens";
import { foundation as f } from "./foundations.style";
import { themeFor } from "./themeFor";

const content = foundationsContent.typography;
const scale = readTypeScale(css);

const meta = { title: "Foundations/Typography" } satisfies Meta;

export default meta;
type TStory = StoryObj<typeof meta>;

/** The two font roles of the active theme, resolved from the tokens. */
export const Family: TStory = {
  render: (_args, context) => {
    const theme = themeFor(context.globals.theme);
    return (
      <div className={f.grid}>
        <div className={f.family}>
          <span className={f.name}>{content.roleSans}</span>
          <span className={f.value}>{theme.fonts["sans"]}</span>
          <p className={f.familySans}>{content.pangram}</p>
        </div>
        <div className={f.family}>
          <span className={f.name}>{content.roleHeading}</span>
          <span className={f.value}>{theme.fonts["heading"]}</span>
          <p className={f.familyHeading}>{content.pangram}</p>
        </div>
      </div>
    );
  },
};

/** Every step of the scale: size, line height, weight and tracking travel together. */
export const Scale: TStory = {
  render: () => (
    <table className={f.table}>
      <caption className={f.caption}>{content.scaleCaption}</caption>
      <thead>
        <tr>
          <th scope="col" className={f.headCell}>
            {content.step}
          </th>
          <th scope="col" className={f.headCell}>
            {content.size}
          </th>
          <th scope="col" className={f.headCell}>
            {content.lineHeight}
          </th>
          <th scope="col" className={f.headCell}>
            {content.weight}
          </th>
          <th scope="col" className={f.headCell}>
            {content.tracking}
          </th>
          <th scope="col" className={f.headCell}>
            {content.preview}
          </th>
        </tr>
      </thead>
      <tbody>
        {scale.map((step) => (
          <tr key={step.name}>
            <th scope="row" className={f.cellName}>
              {step.name}
            </th>
            <td className={f.cell}>{step.size}</td>
            <td className={f.cell}>{step.lineHeight}</td>
            <td className={f.cell}>{step.fontWeight}</td>
            <td className={f.cell}>{step.letterSpacing}</td>
            <td className={f.cell}>
              <span className={f.step[step.name]}>{content.pangram}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** The subscription card's text stack. The price uses `tabular-nums`. */
export const Hierarchy: TStory = {
  render: () => (
    <article className={f.specimen}>
      <p className={f.specimenEyebrow}>{content.specimen.eyebrow}</p>
      <h2 className={f.specimenTitle}>{content.specimen.title}</h2>
      <h3 className={f.specimenSection}>{content.specimen.section}</h3>
      <p className={f.specimenBody}>{content.specimen.body}</p>
      <p className={f.specimenSmall}>{content.specimen.small}</p>
      <p className={f.specimenPrice}>{content.specimen.price}</p>
    </article>
  ),
};
