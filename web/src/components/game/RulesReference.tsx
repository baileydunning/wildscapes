import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TerrainToken } from './TerrainToken';
import { TerrainType } from '@/types/game';

const terrainInfo: { type: TerrainType; name: string; color: string; rules: string }[] = [
  { type: 'field', name: 'Field', color: '#E7C86E', rules: 'Always height 1. Cannot be stacked.' },
  { type: 'water', name: 'Water', color: '#4C8FD6', rules: 'Always height 1. Cannot be stacked.' },
  { type: 'mountain', name: 'Mountain', color: '#8A8F99', rules: 'Stack 1-3 tokens. Max height 3.' },
  { type: 'trunk', name: 'Trunk', color: '#8B5A2B', rules: 'Tree base. Stack 1-2, then Tree Top.' },
  { type: 'treetop', name: 'Tree Top', color: '#3A7F3A', rules: 'Must be on Trunk. Nothing goes on top.' },
  { type: 'building', name: 'Building', color: '#C44848', rules: 'Building roof. Must be on base token.' },
];

export function RulesReference() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          Rules
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80 sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold font-sans">Rules Reference</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-5 text-sm font-sans">
          {/* Terrain Colors */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Environment Tokens</h3>
            <div className="space-y-2">
              {terrainInfo.map((t) => (
                <div key={t.type} className="flex items-start gap-2">
                  <TerrainToken type={t.type} size="sm" asDiv />
                  <div className="flex-1">
                    <span className="font-medium">{t.name}</span>
                    <p className="text-xs text-muted-foreground">{t.rules}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Stacking Rules */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Stacking Rules</h3>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>Field and Water: Never stack (height 1 only)</li>
              <li>Mountain: Stack 1-3 gray tokens (max height 3)</li>
              <li>Tree: 1-2 Trunks + 1 Tree Top on top</li>
              <li>Building: Base (brown/red/gray) + Red Roof</li>
              <li>Cannot place tokens under existing stacks</li>
              <li>Cannot place on tiles with animal cubes</li>
            </ul>
          </section>

          {/* Turn Sequence */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Turn Sequence</h3>
            <ol className="space-y-1 text-muted-foreground text-xs list-decimal list-inside">
              <li>Select a slot and take 3 tokens</li>
              <li>Place all 3 tokens on your board</li>
              <li>Take 1 Animal Card (optional, max 4 in hand)</li>
              <li>Place animal cubes if patterns match (optional)</li>
            </ol>
          </section>

          {/* Scoring */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Scoring</h3>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>Trees: Each stack ending with a Tree Top scores by height:<br />
                &nbsp;&nbsp;• Height 1 (just Tree Top): 1 point<br />
                &nbsp;&nbsp;• Height 2 (Trunk + Tree Top): 3 points<br />
                &nbsp;&nbsp;• Height 3 (Trunk + Trunk + Tree Top): 7 points
              </li>
              <li>Mountains: Each range of orthogonally adjacent mountains of the same height scores:<br />
                &nbsp;&nbsp;• Height 1: 1 point per mountain<br />
                &nbsp;&nbsp;• Height 2: 3 points per mountain<br />
                &nbsp;&nbsp;• Height 3: 6 points per mountain
              </li>
              <li>Fields: Each group of 2 orthogonally connected yellow field tiles counts as 1 field worth 5 points. Multiple separate groups score separately (e.g., two groups of 2 = 10 points).</li>
              <li>Buildings: Each stack of 2 (base + red roof) scores 2 points. Adjacency does not matter.</li>
              <li>Water: Each river scores:<br />
                &nbsp;&nbsp;• Length 1: 0 points<br />
                &nbsp;&nbsp;• Length 2: 2 points<br />
                &nbsp;&nbsp;• Length 3: 5 points<br />
                &nbsp;&nbsp;• Length 4: 8 points<br />
                &nbsp;&nbsp;• Length 5: 11 points<br />
                &nbsp;&nbsp;• Length 6: 15 points<br />
                &nbsp;&nbsp;• Length 7+: 15 + 4 points for each additional tile<br />
              </li>
              <li>Animals: For each animal placed, score the full card value. If you place the same animal multiple times, multiply its card value by the number placed (e.g., 2 foxes = double fox points).</li>
              <li>Incomplete Animals: 0 points</li>
            </ul>
          </section>

          {/* Endgame */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Endgame</h3>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>Token bag empty and cannot refill slot</li>
              <li>Player ends turn with 2 or fewer empty spaces</li>
              <li>Finish round so all players have equal turns</li>
              <li>Tiebreaker: Most cubes placed</li>
            </ul>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
