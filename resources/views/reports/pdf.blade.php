<!DOCTYPE html>
<html>
<head>
    <title>Laporan Penjualan POS</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #333; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #2c3e50; }
        .header h2 { margin: 0; color: #2c3e50; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
        .header p { margin: 5px 0 0; color: #7f8c8d; font-size: 12px; }
        
        .section-title { font-size: 14px; color: #2c3e50; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; font-weight: bold; }
        
        /* Grid untuk Summary */
        .summary-box { border: 1px solid #ddd; padding: 10px; background-color: #f9f9f9; border-radius: 4px; margin-bottom: 20px; }
        .summary-table { width: 100%; border: none; margin: 0; }
        .summary-table td { border: none; padding: 4px 8px; font-size: 12px; }
        .summary-label { font-weight: bold; color: #555; width: 130px; }
        .summary-value { font-weight: bold; color: #000; }

        table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 7px; text-align: left; }
        th { background-color: #f4f6f7; font-weight: bold; color: #2c3e50; text-transform: uppercase; font-size: 10px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { font-weight: bold; background-color: #e8f4f8; }
        
        /* Memaksa halaman baru jika diperlukan */
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN PENJUALAN RESTORAN</h2>
        <p>Periode: {{ $startDate }} s/d {{ $endDate }}</p>
    </div>

    <div class="section-title">RINGKASAN STATISTIK</div>
    <div class="summary-box">
        <table class="summary-table">
            <tr>
                <td class="summary-label">Total Omset Kotor</td>
                <td class="summary-value">: Rp {{ number_format(round($totalSales), 0, ',', '.') }}</td>
                <td class="summary-label">Pajak PB1 (10%)</td>
                <td class="summary-value">: Rp {{ number_format(round($totalTax), 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="summary-label">Total Transaksi</td>
                <td class="summary-value">: {{ $totalOrders }} struk</td>
                <td class="summary-label">Rata-rata Order (AOV)</td>
                <td class="summary-value">: Rp {{ number_format(round($aov), 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="summary-label">Item Terjual</td>
                <td class="summary-value">: {{ $totalItemsSold }} porsi</td>
                <td class="summary-label">Metode Pembayaran</td>
                <td class="summary-value">: 
                    @foreach($paymentMethods as $method => $count)
                        {{ strtoupper(str_replace('_', ' ', $method)) }} ({{ $count }}x)@if(!$loop->last), @endif
                    @endforeach
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title">DAFTAR TRANSAKSI</div>
    <table>
        <thead>
            <tr>
                <th width="15%">Waktu</th>
                <th width="18%">Invoice</th>
                <th class="text-center" width="10%">Item</th>
                <th width="15%">Pembayaran</th>
                <th class="text-right" width="20%">Pajak (10%)</th>
                <th class="text-right" width="22%">Total Bersih</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orders as $order)
            <tr>
                <td>{{ $order->created_at->timezone('Asia/Jakarta')->format('d M Y H:i') }}</td>
                <td style="font-family: monospace;">INV-{{ strtoupper(substr($order->id, 0, 6)) }}</td>
                <td class="text-center">{{ $itemCounts[$order->id] ?? 0 }}</td>
                <td>{{ strtoupper(str_replace('_', ' ', $order->payment_method)) }}</td>
                <td class="text-right">Rp {{ number_format(round($order->total_price * 0.10), 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format(round($order->total_price), 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="4" class="text-right">TOTAL KESELURUHAN</td>
                <td class="text-right">Rp {{ number_format(round($totalTax), 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format(round($totalSales), 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="page-break"></div>

    <div class="section-title">MENU PALING LARIS (TOP 10)</div>
    <table>
        <thead>
            <tr>
                <th width="10%" class="text-center">No</th>
                <th width="50%">Nama Menu</th>
                <th width="20%" class="text-center">Terjual (Porsi)</th>
                <th width="20%" class="text-right">Estimasi Omset</th>
            </tr>
        </thead>
        <tbody>
            @forelse($topMenus as $index => $menu)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $menu->name }}</td>
                <td class="text-center">{{ $menu->total_qty }}</td>
                <td class="text-right">Rp {{ number_format(round($menu->total_revenue), 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="4" class="text-center text-muted">Belum ada data penjualan menu.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">ANALISIS JAM RAMAI (PEAK HOURS)</div>
    <table style="width: 50%;">
        <thead>
            <tr>
                <th class="text-center" width="40%">Rentang Jam</th>
                <th class="text-center" width="60%">Jumlah Transaksi</th>
            </tr>
        </thead>
        <tbody>
            @forelse($peakHours as $peak)
            <tr>
                <td class="text-center">{{ str_pad($peak->hour, 2, '0', STR_PAD_LEFT) }}:00 - {{ str_pad($peak->hour + 1, 2, '0', STR_PAD_LEFT) }}:00</td>
                <td class="text-center">{{ $peak->total_orders }} struk</td>
            </tr>
            @empty
            <tr>
                <td colspan="2" class="text-center">Belum ada data waktu transaksi.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>