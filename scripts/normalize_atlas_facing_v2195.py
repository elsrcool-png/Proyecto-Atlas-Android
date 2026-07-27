#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageOps
import json, shutil

ROOT = Path(__file__).resolve().parents[1]
HERO_ROOT = ROOT / 'public/assets/atlas/heroes/maestro_v1/runtime'
ENEMY_ROOT = ROOT / 'public/assets/atlas/enemies/maestro_v1/runtime'
ARCTIC_ZIP_EXTRACT = Path('/mnt/data/arctic_npc_extract/Atlas_NPC_Region_Artica_Maestro_v1.0')
ARCTIC_OUT = ROOT / 'public/assets/atlas/npcs/region_artica/maestro_v1/runtime'

# sourceDirection is the approved side image; sourceFacing is what it truly faces.
HERO = {
    'humano_guerrero': ('right', 'right'),
    'humano_mago': ('right', 'right'),
    'humano_picaro': ('right', 'right'),
    'elfo_guerrero': ('right', 'right'),
    'elfo_mago': ('right', 'right'),
    'elfo_picaro': ('right', 'right'),
    'enano_guerrero': ('left', 'right'),
    'enano_mago': ('left', 'right'),
    'enano_picaro': ('left', 'right'),
}
ENEMY = {
    'asesino_esqueletico': ('left', 'right'),
    'asesino_orco': ('left', 'left'),
    'aurel_ultimo_portador': ('left', 'left'),
    'brujo_feral': ('left', 'left'),
    'chaman_orco': ('left', 'left'),
    'guardian_verde': ('right', 'left'),
    'guerrero_esqueletico': ('left', 'left'),
    'lobo_salvaje': ('left', 'left'),
    'necromante': ('left', 'right'),
    'orco_bruto': ('right', 'left'),
    'pantera_sombria': ('left', 'left'),
}

ARCTIC_SHEETS = {
    'explorador_boreas_01.png': 'fria_boreas',
    'cartografa_lyra_01.png': 'fria_lyra_cartographer',
    'cazadora_freya_01.png': 'fria_freya',
    'mercader_boreal_01.png': 'fria_merchant_camp',
    'guardian_refugio_boreal_01.png': 'fria_refuge_keeper',
    'montanista_dvalin_01.png': 'fria_dvalin',
    'chaman_del_hielo_01.png': 'fria_shaman',
    'mercader_glacial_01.png': 'fria_merchant_glacial',
    'posadera_helga_01.png': 'fria_helga',
    'pescadora_astra_01.png': 'fria_astra',
    'reina_del_hielo_01.png': 'fria_queen',
    'investigadora_lyra_01.png': 'fria_lyra_researcher',
    'capitan_boreal_01.png': 'fria_captain',
    'forjador_kael_01.png': 'fria_kael_forger',
    'mercader_real_boreal_01.png': 'fria_merchant_royal',
    'hostalera_boreal_01.png': 'fria_hostelera',
}


def normalize_pair(root: Path, asset_id: str, source_dir: str, source_facing: str):
    folder = root / asset_id
    source_path = folder / f'{source_dir}.webp'
    if not source_path.exists():
        raise FileNotFoundError(source_path)
    source = Image.open(source_path).convert('RGBA')
    right = source if source_facing == 'right' else ImageOps.mirror(source)
    left = ImageOps.mirror(right)
    right.save(folder / 'right.webp', 'WEBP', lossless=True, quality=100, method=2)
    left.save(folder / 'left.webp', 'WEBP', lossless=True, quality=100, method=2)


def crop_runtime(sheet_path: Path, out_dir: Path):
    im = Image.open(sheet_path).convert('RGBA')
    w, h = im.size
    quadrants = {
        'down': (0, 0, w // 2, h // 2),
        'up': (w // 2, 0, w, h // 2),
        'left': (0, h // 2, w // 2, h),
        'right': (w // 2, h // 2, w, h),
    }
    out_dir.mkdir(parents=True, exist_ok=True)
    for direction, box in quadrants.items():
        q = im.crop(box)
        alpha = q.getchannel('A')
        bbox = alpha.getbbox()
        if not bbox:
            raise RuntimeError(f'No alpha content in {sheet_path.name}:{direction}')
        q = q.crop(bbox)
        # Preserve contact shadow and fit the approved 72x96 runtime canvas.
        max_w, max_h = 68, 92
        scale = min(max_w / q.width, max_h / q.height)
        size = (max(1, round(q.width * scale)), max(1, round(q.height * scale)))
        q = q.resize(size, Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (72, 96), (0, 0, 0, 0))
        x = (72 - q.width) // 2
        y = 96 - q.height
        canvas.alpha_composite(q, (x, y))
        canvas.save(out_dir / f'idle_{direction}.webp', 'WEBP', lossless=True, quality=100, method=2)


def main():
    for asset_id, (src, facing) in HERO.items():
        normalize_pair(HERO_ROOT, asset_id, src, facing)
    for asset_id, (src, facing) in ENEMY.items():
        normalize_pair(ENEMY_ROOT, asset_id, src, facing)

    integrated = []
    if ARCTIC_ZIP_EXTRACT.exists():
        for p in ARCTIC_ZIP_EXTRACT.rglob('*.png'):
            variant = ARCTIC_SHEETS.get(p.name)
            if not variant:
                continue
            crop_runtime(p, ARCTIC_OUT / variant)
            integrated.append(variant)

    manifest = {
        'version': '2.19.5',
        'heroesNormalized': sorted(HERO),
        'enemiesNormalized': sorted(ENEMY),
        'arcticNpcRuntimeIntegrated': sorted(integrated),
        'directions': ['down', 'up', 'left', 'right'],
        'runtimeCanvasNpc': [72, 96],
    }
    out = ROOT / 'docs/ATLAS_V2_19_5_FACING_ASSET_MANIFEST.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps(manifest, ensure_ascii=False))

if __name__ == '__main__':
    main()
