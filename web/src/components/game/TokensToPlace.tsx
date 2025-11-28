import { TerrainToken as TerrainTokenType } from '@/types/game';
import { TerrainToken } from './TerrainToken';

interface TokensToPlaceProps {
  tokens: TerrainTokenType[];
  selectedIndex: number | null;
  onTokenSelect: (index: number) => void;
}

const terrainNames: Record<string, string> = {
  field: 'Field',
  water: 'Water',
  mountain: 'Mountain',
  trunk: 'Trunk',
  treetop: 'Tree Top',
  building: 'Roof',
};

export function TokensToPlace({ tokens, selectedIndex, onTokenSelect }: TokensToPlaceProps) {
  if (tokens.length === 0) return null;
  
  return (
    <div className="game-card p-3">
      <h3 className="font-semibold text-sm text-foreground mb-2 font-sans">Tokens to Place</h3>
      <div className="flex items-center justify-center gap-4">
        {tokens.map((token, index) => (
          <div key={token.id} className="flex flex-col items-center gap-1.5">
            <TerrainToken
              type={token.type}
              size="lg"
              onClick={() => onTokenSelect(index)}
              selected={selectedIndex === index}
            />
            <span className="text-[10px] text-muted-foreground font-sans">
              {terrainNames[token.type]}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2.5 font-sans">
        Select token, then click a hex to place
      </p>
    </div>
  );
}
