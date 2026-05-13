/**
 * Module-level singleton flag shared between DropZoneNode and Canvas.
 * When a drag-drop lands on a DropZoneNode it sets this flag.
 * Canvas.onDrop reads and resets it to skip its own placement handler,
 * preventing double-node-creation for the same drop event.
 */
let _droppedOnZone = false;

export function markDroppedOnZone(): void {
  _droppedOnZone = true;
}

export function consumeDroppedOnZone(): boolean {
  const val = _droppedOnZone;
  _droppedOnZone = false;
  return val;
}
