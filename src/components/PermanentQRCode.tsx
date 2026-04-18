import React from 'react';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PermanentQRCode({ residentId }: { residentId: string }) {
  return (
    <Card className="max-w-sm mx-auto mt-6">
      <CardHeader>
        <CardTitle>Your Permanent Access QR</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <QRCode value={residentId} size={256} className="mb-4" />
        <p className="font-mono text-slate-500">{residentId}</p>
      </CardContent>
    </Card>
  );
}
