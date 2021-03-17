import React from 'react';
import { Typography } from '@material-ui/core';

function Tiles() {
    return (
        <div>
            <Typography variant="h4">Tiles</Typography>
            <Typography>The game board is a grid made up of tiles. Here is what each tile does.</Typography>
            <br />
            <Typography variant="h5">Undiscovered</Typography>
            <img src="/tiles/unknown.png" width={80} />
            <Typography>This tile could be anything! Reveal what's hiding underneath by moving over it with the ship or using a compass card next to it. Every tile except the ship's starting tile begins covered by an Undiscovered tile (unless you're playing with the "Play with all tiles revealed" option, then no tiles are undiscovered).</Typography>
            <br />
            <Typography variant="h5">Water</Typography>
            <img src="/tiles/water.png" width={80} />
            <Typography>These tiles do nothing.</Typography>
            <br />
            <Typography variant="h5">Treasure</Typography>
            <img src="/tiles/treasure.png" width={80} />
            <Typography>Move onto a treasure tile to collect it, turning the tile into a water tile. If the pirates collect all of these, they win. You can change the match options so that these restore your HP upon collections.</Typography>
            <br />
            <Typography variant="h5">Rock</Typography>
            <img src="/tiles/rock.png" width={80} />
            <Typography>Rock tiles deal 1 damage (configurable amount) to the ship each time you cross over them.</Typography>
            <br />
            <Typography variant="h5">Iceberg</Typography>
            <img src="/tiles/iceberg.png" width={80} />
            <Typography>Same effect as the rock tile, except it breaks and turns into a water tile upon being touched by the ship (after dealing damage, of course).</Typography>
            <br />
            <Typography variant="h5">Waves</Typography>
            <img src="/tiles/waves.png" width={80} />
            <Typography>Wave tiles push the ship 1 extra tile in the direction it's facing.</Typography>
            <br />
            <Typography variant="h5">Storm</Typography>
            <img src="/tiles/storm.png" width={80} />
            <Typography>Storm tiles turn the ship to face a random direction then teleports it to a random tile</Typography>
            <br />
            <Typography variant="h5">Booze</Typography>
            <img src="/tiles/alcohol.png" width={80} />
            <Typography>Booze tiles turn the ship to face a random direction then push it forward 1 tile in that direction.</Typography>
            <br />
            <Typography variant="h5">Whirlpools</Typography>
            <img src="/tiles/whirlpoolleft.png" width={80} />
            <img src="/tiles/whirlpoolright.png" width={80} />
            <Typography>Upon touching a whirlpool tile, the ship turns 90° the way the whirlpool is facing.</Typography>
        </div>
    );
};

export default Tiles;