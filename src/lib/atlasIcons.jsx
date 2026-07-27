// PROYECTO ATLAS — Registro de iconos del juego (lucide-react)
import {
  Swords, Sword, Wand2, User, Leaf, Hammer, Skull, Sparkles, Moon, Footprints,
  Bird, Cat, Bone, Ghost, Crown, Flame, Triangle, Zap, Eye, Network, Cloud,
  Frown, ArrowDown, Wind, Brain, Tent, Home, Castle, TreePine, Trees, Mountain,
  MountainSnow, Waves, Snowflake, Droplet, Sun, Palmtree, Landmark,
  Target, Shield, Compass, Package, PackageOpen, Globe, Gem, Trophy,
  MessageCircle, Star, Dices, Check, Heart, Circle, Scroll, Coins, Lock, Info,
} from "lucide-react";

const ICONS = {
  swords: Swords, sword: Sword, wand2: Wand2,
  user: User, leaf: Leaf, hammer: Hammer,
  skull: Skull, sparkles: Sparkles, moon: Moon, footprints: Footprints,
  bat: Bird, cat: Cat, bone: Bone, ghost: Ghost,
  crown: Crown, dragon: Flame,
  triangle: Triangle, zap: Zap, eye: Eye, network: Network, cloud: Cloud,
  frown: Frown, arrowdown: ArrowDown, wind: Wind, brain: Brain,
  tent: Tent, home: Home, castle: Castle,
  treepine: TreePine, trees: Trees, mountain: Mountain, mountainsnow: MountainSnow,
  waves: Waves, snowflake: Snowflake, droplet: Droplet, sun: Sun,
  palmtree: Palmtree, cactus: Mountain, landmark: Landmark,
  target: Target, shield: Shield, compass: Compass,
  package: Package, packageopen: PackageOpen, globe: Globe,
  gem: Gem, trophy: Trophy, message: MessageCircle,
  star: Star, dices: Dices, flame: Flame, check: Check, heart: Heart,
  scroll: Scroll, coin: Coins, lock: Lock, info: Info,
};

const COLORS = {
  swords: "#f87171", sword: "#fbbf24", wand2: "#c084fc",
  user: "#cbd5e1", leaf: "#86efac", hammer: "#fbbf24",
  skull: "#e2e8f0", sparkles: "#67e8f9", moon: "#a5b4fc", footprints: "#d6d3d1",
  bat: "#94a3b8", cat: "#a78bfa", bone: "#e7e5e4", ghost: "#bae6fd",
  crown: "#fbbf24", dragon: "#fb7185",
  triangle: "#f87171", zap: "#facc15", eye: "#a78bfa", network: "#94a3b8", cloud: "#86efac",
  frown: "#fca5a5", arrowdown: "#f87171", wind: "#a5f3fc", brain: "#f0abfc",
  tent: "#f4a261", home: "#d6c1a3", castle: "#cbd5e1",
  treepine: "#4ade80", trees: "#4ade80", mountain: "#a8a29e", mountainsnow: "#e0f2fe",
  waves: "#38bdf8", snowflake: "#e0f2fe", droplet: "#7dd3fc", sun: "#fbbf24",
  palmtree: "#86efac", cactus: "#84cc16", landmark: "#d6bcfa",
  target: "#f59e0b", shield: "#7dd3fc", compass: "#67e8f9",
  package: "#d6c1a3", packageopen: "#f59e0b", globe: "#c4b5fd",
  gem: "#5eead4", trophy: "#fbbf24", message: "#67e8f9",
  star: "#fbbf24", dices: "#67e8f9", flame: "#fb7185",
  check: "#4ade80", heart: "#f87171",
  scroll: "#67e8f9", coin: "#fbbf24", lock: "#cbd5e1", info: "#cbd5e1",
};

export function GIcon({ name, size = 24, className = "", style, strokeWidth = 2 }) {
  const Icon = ICONS[name] || Circle;
  return <Icon size={size} strokeWidth={strokeWidth} className={className} style={{ color: COLORS[name] || "currentColor", ...style }} />;
}

export const ICON_COLOR = COLORS;