import type { Meta, StoryObj } from "@storybook/react-vite";
import { foundationsContent as content } from "@/content/foundations";
import { StatusIcon } from "@/shared/icons/StatusIcon";
import { contrastRatio } from "@/shared/utils/colorContrast";
import { cx } from "@/shared/utils/cx";
import { contrastPairs, minimumRatio } from "@/styles/contrastPairs";
import { semanticColorTokens } from "@/styles/themeContract";
import { foundation as f } from "./foundations.style";
import { themeFor } from "./themeFor";

const statuses = ["active", "paused", "cancelled", "danger"] as const;

const meta = { title: "Foundations/Color" } satisfies Meta;

export default meta;
type TStory = StoryObj<typeof meta>;

/** Semantic colors: the only ones components use, through utilities such as `bg-surface`. */
export const Semantic: TStory = {
  render: (_args, context) => {
    const theme = themeFor(context.globals.theme);
    return (
      <ul className={f.grid}>
        {semanticColorTokens.map((name) => (
          <li key={name} className={f.card}>
            <span
              className={f.swatch}
              style={{ backgroundColor: `var(--color-${name})` }}
              aria-hidden="true"
            />
            <span className={f.name}>{name}</span>
            <span className={f.value}>{theme.colors[name]}</span>
            <span className={f.description}>{content.tokenPurpose[name]}</span>
          </li>
        ))}
      </ul>
    );
  },
};

/** Primitive palette: raw values. Components never use these directly. */
export const Palette: TStory = {
  render: (_args, context) => {
    const theme = themeFor(context.globals.theme);
    return (
      <>
        <p className={f.note}>{content.paletteNote}</p>
        <ul className={f.grid}>
          {Object.entries(theme.primitives).map(([name, value]) => (
            <li key={name} className={f.card}>
              <span
                className={f.swatch}
                style={{ backgroundColor: `var(${name})` }}
                aria-hidden="true"
              />
              <span className={f.name}>{name}</span>
              <span className={f.value}>{value}</span>
            </li>
          ))}
        </ul>
      </>
    );
  },
};

/** The four statuses, each with its own icon and word. */
export const Status: TStory = {
  render: () => (
    <>
      <p className={f.note}>{content.statusNote}</p>
      <ul className={f.pills}>
        {statuses.map((status) => (
          <li key={status} className={cx(f.pillBase, f.pill[status])}>
            <StatusIcon status={status} />
            {content.statusWords[status]}
          </li>
        ))}
      </ul>
    </>
  ),
};

/** The ratio of every tested pair, computed from the resolved token values. */
export const Contrast: TStory = {
  render: (_args, context) => {
    const theme = themeFor(context.globals.theme);
    return (
      <table className={f.table}>
        <caption className={f.caption}>{content.contrast.caption}</caption>
        <thead>
          <tr>
            <th scope="col" className={f.headCell}>
              {content.contrast.pair}
            </th>
            <th scope="col" className={f.headCell}>
              {content.contrast.preview}
            </th>
            <th scope="col" className={f.headCell}>
              {content.contrast.ratio}
            </th>
            <th scope="col" className={f.headCell}>
              {content.contrast.required}
            </th>
            <th scope="col" className={f.headCell}>
              {content.contrast.result}
            </th>
          </tr>
        </thead>
        <tbody>
          {contrastPairs.map(({ fg, bg, kind }) => {
            const ratio = contrastRatio(theme.colors[fg]!, theme.colors[bg]!);
            const minimum = minimumRatio(kind);
            return (
              <tr key={`${fg}/${bg}`}>
                <th scope="row" className={f.cellName}>
                  {fg} on {bg}
                </th>
                <td className={f.cell}>
                  {kind === "text" ? (
                    <span
                      className={f.sample}
                      style={{
                        color: `var(--color-${fg})`,
                        backgroundColor: `var(--color-${bg})`,
                      }}
                    >
                      {content.contrast.sample}
                    </span>
                  ) : (
                    <span
                      className={f.shape}
                      style={{
                        borderColor: `var(--color-${fg})`,
                        backgroundColor: `var(--color-${bg})`,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </td>
                <td className={f.cell}>{ratio.toFixed(2)}:1</td>
                <td className={f.cell}>
                  {minimum}:1 {kind === "text" ? content.contrast.text : content.contrast.ui}
                </td>
                <td className={f.cell}>
                  {ratio >= minimum ? content.contrast.pass : content.contrast.fail}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  },
};
