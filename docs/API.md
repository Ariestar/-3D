# API

## store
- `chunks: Record<string, Block[]>`
- `selectedBlock: BlockType`
- `inventory: Record<BlockType, number>`
- `setSelectedBlock(type)`
- `addBlock(x,y,z,type)`
- `removeBlock(x,y,z)`
- `getBlock(x,y,z)`
- `setChunks(chunks)`
- `setInventory(inv)`
- `decreaseItem(type, amount)`

## events
- `subscribe(event, handler)`
- `publish(event, payload)`

