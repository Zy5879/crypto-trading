import React from "react";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Circle,
  Text as SvgText,
  Rect,
} from "react-native-svg";
import { View } from "react-native";

type Props = {
  values: number[];
  height?: number;
  strokeWidth?: number;
  upColor?: string;
  downColor?: string;
  showAxis?: boolean;
  showLatest?: boolean;
  tooltipCenter?: boolean;
  colorSignOverride?: number;
};

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export default function Chart({
  values,
  height = 140,
  strokeWidth = 2,
  upColor = "#22c55e",
  downColor = "#ef4444",
  showAxis = false,
  showLatest = false,
  tooltipCenter = true,
  colorSignOverride,
}: Props) {
  if (!values || values.length < 2) return <View style={{ height }} />;

  const W = 360; // viewBox width (scales to 100% container)
  const H = height; // viewBox height

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1e-9);

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return [x, y] as const;
  });

  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0]} ${pts[i][1]}`;
  const dArea = `${d} L ${W} ${H} L 0 ${H} Z`;

  const seriesUp = values[values.length - 1] >= values[0];
  const up = colorSignOverride != null ? colorSignOverride >= 0 : seriesUp;
  const stroke = up ? upColor : downColor;

  // Tooltip state
  const [hoverX, setHoverX] = React.useState<number | null>(null);
  const idxFromX = (x: number) =>
    Math.max(
      0,
      Math.min(values.length - 1, Math.round((x / W) * (values.length - 1)))
    );
  const hoverIdx = hoverX == null ? null : idxFromX(hoverX);
  const hoverY = hoverIdx == null ? null : pts[hoverIdx][1];
  const hoverVal = hoverIdx == null ? null : values[hoverIdx];

  // Latest value chip on the right
  const [rx, ry] = pts[pts.length - 1];
  const latest = values[values.length - 1];

  // Tooltip pill dimensions & centered X
  const pillW = 110;
  const pillCX = W / 2;

  // When centered: use pillCX; when not, follow finger but clamp inside the chart
  const pillRectX =
    hoverIdx == null
      ? -9999
      : tooltipCenter
      ? pillCX - pillW / 2
      : clamp(pts[hoverIdx][0] - pillW / 2, 0, W - pillW);

  const pillTextX =
    hoverIdx == null
      ? -9999
      : tooltipCenter
      ? pillCX
      : clamp(pts[hoverIdx][0], 6, W - 6);

  return (
    <Svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => setHoverX(e.nativeEvent.locationX)}
      onResponderMove={(e) => setHoverX(e.nativeEvent.locationX)}
      onResponderRelease={() => setHoverX(null)}
      onResponderTerminate={() => setHoverX(null)}
    >
      <Defs>
        <LinearGradient id="g" x1="0" y1="0" x2="0" y2={H}>
          <Stop offset="0" stopColor={stroke} stopOpacity="0.25" />
          <Stop offset="1" stopColor={stroke} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* optional grid */}
      {showAxis && (
        <>
          {[0, 0.5, 1].map((t, i) => {
            const y = H - t * H;
            const val = min + t * range;
            return (
              <React.Fragment key={i}>
                <Line
                  x1={0}
                  x2={W}
                  y1={y}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="3 4"
                />
                <SvgText
                  x={W - 4}
                  y={y - 2}
                  textAnchor="end"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {fmtUSD(val)}
                </SvgText>
              </React.Fragment>
            );
          })}
        </>
      )}

      {/* area + line */}
      <Path d={dArea} fill="url(#g)" />
      <Path d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" />

      {/* latest chip */}
      {showLatest && (
        <>
          <Rect
            x={Math.min(W - 90, Math.max(0, rx - 45))}
            y={Math.max(4, ry - 18)}
            width={90}
            height={18}
            rx={6}
            fill={stroke}
            opacity={0.15}
          />
          <SvgText
            x={Math.min(W - 6, Math.max(6, rx))}
            y={Math.max(18, ry - 5)}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill={stroke}
          >
            {fmtUSD(latest)}
          </SvgText>
        </>
      )}

      {hoverIdx != null && hoverY != null && hoverVal != null && (
        <>
          <Line
            x1={pts[hoverIdx][0]}
            x2={pts[hoverIdx][0]}
            y1={0}
            y2={H}
            stroke="#94a3b8"
          />
          <Circle cx={pts[hoverIdx][0]} cy={hoverY} r={4} fill={stroke} />
          <Rect
            x={pillRectX}
            y={Math.max(4, hoverY - 26)}
            width={pillW}
            height={20}
            rx={6}
            fill="#111827"
            opacity={0.9}
          />
          <SvgText
            x={pillTextX}
            y={Math.max(18, hoverY - 12)}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#fff"
          >
            {fmtUSD(hoverVal)}
          </SvgText>
        </>
      )}
    </Svg>
  );
}
