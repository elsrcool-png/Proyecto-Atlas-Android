import React from "react";
import ModularHeroSprite from "./ModularHeroSprite";
export default function ChibiSprite({ player, race="Humano", cls, dir="down", frame=0, size=56, style, surface="characterSheet" }) {
  return <ModularHeroSprite player={player} race={race} cls={cls} direction={dir} size={size} style={style} surface={surface} animationToken={frame} />;
}
