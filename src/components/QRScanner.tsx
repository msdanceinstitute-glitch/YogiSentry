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
          onResult={(text) => {
            setData(text);
            toast.success(`Scanned: ${text}`);
            // Logic to verify against backend/store
          }}
          onError={(error) => console.log(error?.message)}
        />
        {data && <p className="mt-4 text-center font-mono">Last Scanned: {data}</p>}
      </CardContent>
    </Card>
  );
}
