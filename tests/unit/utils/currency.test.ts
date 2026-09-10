// Simple unit test for currency formatting logic
describe('Currency Utility', () => {
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  it('formats positive numbers to IDR properly', () => {
    expect(formatRupiah(50000)).toMatch(/50\.000/);
  });

  it('formats zero correctly', () => {
    expect(formatRupiah(0)).toMatch(/0/);
  });
});