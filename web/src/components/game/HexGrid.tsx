import { HexPosition, PlacedToken, TerrainToken as TerrainTokenType, PlacedAnimalEmoji } from '@/types/game';
import { cn } from '@/lib/utils';

interface HexGridProps {
  placedTokens: PlacedToken[];
  placedEmojis?: PlacedAnimalEmoji[];
  onHexClick: (position: HexPosition) => void;
  highlightedHexes?: HexPosition[];
  selectedTokenType?: TerrainTokenType | null;
  isPlacingEmoji?: boolean;
}

function generateHexPositions(radius: number): HexPosition[] {
  const positions: HexPosition[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.abs(s) <= radius) {
        positions.push({ q, r });
      }
    }
  }
  return positions;
}

const hexPositions = generateHexPositions(3);

function hexToPixel(hex: HexPosition, size: number): { x: number; y: number } {
  const x = size * (3/2 * hex.q);
  const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

const terrainColors: Record<string, { bg: string; border: string }> = {
  field: { bg: '#E7C86E', border: '#D4B85A' },
  water: { bg: '#4C8FD6', border: '#3A7BC4' },
  mountain: { bg: '#8A8F99', border: '#7A7F89' },
  trunk: { bg: '#8B5A2B', border: '#7A4A1B' },
  treetop: { bg: '#3A7F3A', border: '#2A6F2A' },
  building: { bg: '#C44848', border: '#B43838' },
};

export function HexGrid({ 
  placedTokens, 
  placedEmojis = [],
  onHexClick, 
  highlightedHexes = [], 
  selectedTokenType,
  isPlacingEmoji 
}: HexGridProps) {
  const hexSize = 30;
  const gridWidth = hexSize * 8;
  const gridHeight = hexSize * 7 * Math.sqrt(3);
  
  const getTokensAtPosition = (pos: HexPosition) => {
    return placedTokens
      .filter(t => t.position.q === pos.q && t.position.r === pos.r)
      .sort((a, b) => a.stackLevel - b.stackLevel);
  };
  
  const getEmojiAtPosition = (pos: HexPosition) => {
    return placedEmojis.find(e => e.position.q === pos.q && e.position.r === pos.r);
  };
  
  const isHighlighted = (pos: HexPosition) => {
    return highlightedHexes.some(h => h.q === pos.q && h.r === pos.r);
  };
  
  return (
    <div 
      className="relative bg-board rounded-lg p-3 border border-border"
      style={{ width: gridWidth + 24, height: gridHeight + 24 }}
    >
      <div className="absolute inset-0 pattern-dots opacity-10 rounded-lg" />
      
      <div className="relative" style={{ width: gridWidth, height: gridHeight }}>
        {hexPositions.map((pos) => {
          const { x, y } = hexToPixel(pos, hexSize);
          const tokens = getTokensAtPosition(pos);
          const emoji = getEmojiAtPosition(pos);
          const highlighted = isHighlighted(pos);
          const isEmpty = tokens.length === 0;
          const stackHeight = tokens.length;
          const topToken = tokens[tokens.length - 1];
          const topColors = topToken ? terrainColors[topToken.token.type] : null;
          
          return (
            <div
              key={`${pos.q}-${pos.r}`}
              className="absolute"
              style={{
                left: gridWidth / 2 + x - hexSize,
                top: gridHeight / 2 + y - hexSize,
                width: hexSize * 2,
                height: hexSize * 2,
              }}
            >
              <button
                onClick={() => onHexClick(pos)}
                className={cn(
                  'hex-cell w-full h-full transition-all duration-150',
                  highlighted && (selectedTokenType || isPlacingEmoji) && 'animate-pulse-soft',
                  isEmpty && 'hover:brightness-95',
                  isPlacingEmoji && !isEmpty && 'hover:ring-2 hover:ring-primary hover:ring-offset-1'
                )}
                style={{
                  backgroundColor: isEmpty ? 'hsl(var(--hex-border))' : topColors?.border,
                }}
              >
                <div 
                  className="hex-cell-inner flex items-center justify-center"
                  style={{
                    backgroundColor: isEmpty ? 'hsl(var(--hex-bg))' : topColors?.bg,
                  }}
                >
                  {tokens.length > 0 && (
                    <div className="relative flex items-center justify-center w-full h-full">
                      {/* Show layered effect for stacks */}
                      {stackHeight > 1 && !emoji && (
                        <>
                          <div 
                            className="absolute inset-2 rounded-sm opacity-40"
                            style={{
                              backgroundColor: terrainColors[tokens[0].token.type].border,
                              transform: 'translateY(4px)',
                            }}
                          />
                          {stackHeight > 2 && (
                            <div 
                              className="absolute inset-2 rounded-sm opacity-30"
                              style={{
                                backgroundColor: terrainColors[tokens[Math.floor(tokens.length / 2)].token.type].border,
                                transform: 'translateY(2px)',
                              }}
                            />
                          )}
                        </>
                      )}
                      
                      {/* Animal emoji or height indicator */}
                      {emoji ? (
                        <span className="relative z-10 text-lg">{emoji.emoji}</span>
                      ) : stackHeight > 1 ? (
                        <span 
                          className="relative z-10 font-sans font-semibold text-white/90 text-sm drop-shadow-sm"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                        >
                          {stackHeight}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
