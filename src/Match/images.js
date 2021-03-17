const images = {
    tiles : {},
    ship: Array(36).fill(null).map((e, i) => {
        let img = new Image();
        img.src = `/ship/${i}.png`
        return img;
    }),
};

for (let i of ['unknown', 'water', 'treasure', 'rock', 'iceberg', 'waves', 'storm', 'alcohol', 'whirlpoolleft', 'whirlpoolright', 'blank']) {
    let src = `/tiles/${i}.png`;
    images.tiles[i] = new Image();
    images.tiles[i].src = src;
}

images.ship.src = '/ship.png';

export default images;