import * as React from "react";
import { RGBColor, SketchPicker } from "react-color";
import { useToggle } from "react-use";
import { toColorString } from "../utils";

export interface ColorPickerProps {
  color: RGBColor;
  onChange?: (color: RGBColor) => void;
}

// http://casesandberg.github.io/react-color/
export function ColorPicker(props: ColorPickerProps) {
  const [display, toggleDisplay] = useToggle(false);

  return (
    <div>
      <div
        style={{
          padding: "5px",
          background: "#fff",
          borderRadius: "1px",
          boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
          display: "inline-block",
          cursor: "pointer",
        }}
        onClick={() => toggleDisplay()}
      >
        <div
          style={{
            width: "36px",
            height: "14px",
            borderRadius: "2px",
            background: toColorString(props.color),
          }}
        />
      </div>
      {display ? (
        <div
          style={{
            position: "absolute",
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: "fixed",
              top: "0px",
              right: "0px",
              bottom: "0px",
              left: "0px",
            }}
            onClick={() => toggleDisplay(false)}
          />
          <SketchPicker
            color={props.color}
            onChange={color => {
              props.onChange?.(color.rgb);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
