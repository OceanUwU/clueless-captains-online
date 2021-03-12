const images = {
    tiles : {},
    ship: new Image(),
};

for (let i of ['unknown', 'water', 'treasure', 'rock', 'iceberg', 'blank']) {
    let src = `/tiles/${i}.png`;
    images.tiles[i] = new Image();
    images.tiles[i].src = src;
}

images.ship.src = '/ship.png';

export default images;