/* ═══════════════════════════════════════════════════════════
   NFC Service — Web NFC API Integration
   Read NFC tags to instant-book chargers
   ═══════════════════════════════════════════════════════════ */

export type NFCStatus = 'idle' | 'scanning' | 'detected' | 'error';

/**
 * Check if Web NFC API is available
 */
export function isNFCSupported(): boolean {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
}

/**
 * Start scanning for NFC tags.
 * On Android Chrome (HTTPS only), reads the tag and extracts charger ID.
 */
export async function startNFCScan(
  onChargerDetected: (chargerId: string) => void,
  onError: (error: string) => void
): Promise<void> {
  if (!isNFCSupported()) {
    onError('NFC not supported on this device/browser');
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reader = new (window as any).NDEFReader();
    await reader.scan();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reader.addEventListener('reading', ({ message }: any) => {
      for (const record of message.records) {
        const text = new TextDecoder().decode(record.data);
        // Parse: "evconnect://charger/charger_id_001"
        if (text.startsWith('evconnect://charger/')) {
          const chargerId = text.replace('evconnect://charger/', '');
          onChargerDetected(chargerId);
          return;
        }
      }
      onError('Tag not recognized as EVConnect charger');
    });

    reader.addEventListener('readingerror', () => {
      onError('NFC read failed. Try again.');
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'NFC scan failed';
    onError(msg);
  }
}

/**
 * Simulate NFC detection for demo (safety net)
 */
export function simulateNFCDetection(
  onChargerDetected: (chargerId: string) => void,
  chargerId: string = 'charger_id_001'
): void {
  // Add a small delay to feel realistic
  setTimeout(() => {
    onChargerDetected(chargerId);
  }, 1200);
}

/**
 * Write charger ID to NFC tag (for setup)
 */
export async function writeNFCTag(chargerId: string): Promise<boolean> {
  if (!isNFCSupported()) return false;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writer = new (window as any).NDEFReader();
    await writer.write({
      records: [
        {
          recordType: 'text',
          data: `evconnect://charger/${chargerId}`,
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}
