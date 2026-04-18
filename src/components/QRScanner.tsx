import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function QRScanner() {
  const [data, setData] = useState<string | null>(null);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Visitor QR Scanner</CardTitle>
      </CardHeader>
      <CardContent>
        <Scanner
          onScan={(text) => {
            if (text) {
              setData(text);
              toast.success(`Scanned: ${text}`);
            }
          }}
          onError={(error) => {
            console.log(error);
          }}
        />
        {data && <p className="mt-4 text-center font-mono">Last Scanned: {data}</p>}
      </CardContent>
    </Card>
  );
}
