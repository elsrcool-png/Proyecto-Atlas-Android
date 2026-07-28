import CombatView from "../CombatView";
import AtlasUiProvider from "@/components/atlas/ui/AtlasUiProvider";

// Adaptador sin lógica nueva. Conserva exactamente el contrato de CombatView.
export default function CombatViewAdapterV3(props) {
  return (
    <AtlasUiProvider className="h-full" regionId={props.region?.id} mode="combat">
      <CombatView {...props} />
    </AtlasUiProvider>
  );
}
