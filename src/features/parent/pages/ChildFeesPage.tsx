import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PortalLayout } from '@/components/templates';
import { DataTable } from '@/components/organisms';
import { Card, Dropdown } from '@/components/molecules';
import { Button, Badge, Spinner } from '@/components/atoms';
import { parentService } from '@/services/api';
import { useDebounce } from '@/hooks';
import { formatDate } from '@/utils/formatters';
import { Search } from 'lucide-react';

export const ChildFeesPage = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const childId = searchParams.get('childId') || '';

  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ['child-fees', childId, selectedStatus, selectedYear],
    queryFn: () =>
      parentService.getChildFees(childId, {
        status: selectedStatus,
        academicYear: selectedYear,
        limit: 100,
      }),
    enabled: !!childId,
  });

  const { data: feeSummaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['child-fee-summary', childId],
    queryFn: () => parentService.getChildFeeSummary(childId),
    enabled: !!childId,
  });

  const isLoading = feesLoading || summaryLoading;

  const filteredFees = useMemo(() => {
    if (!feesData?.data) return [];
    return feesData.data.filter(
      (fee) =>
        fee.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        fee.academicYear.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [feesData?.data, debouncedSearch]);

  const feeColumns = [
    {
      key: 'title' as const,
      label: 'Fee Title',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'amount' as const,
      label: 'Amount',
      render: (value: number) => <span className="font-semibold">${value.toFixed(2)}</span>,
    },
    {
      key: 'paidAmount' as const,
      label: 'Paid',
      render: (value: number) => <span>${value.toFixed(2)}</span>,
    },
    {
      key: 'dueDate' as const,
      label: 'Due Date',
      render: (value: string) => <span>{formatDate(new Date(value), 'long')}</span>,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => {
        const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
          paid: 'success',
          partial: 'warning',
          pending: 'info',
          overdue: 'danger',
        };
        return (
          <Badge variant={variants[value] || 'info'}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
    },
  ];

  if (!childId) {
    return (
      <PortalLayout title="Child Fees">
        <Card className="border-danger-200 bg-danger-50 dark:border-danger-900 dark:bg-danger-950">
          <p className="text-danger-700 dark:text-danger-200">Please select a child first</p>
        </Card>
      </PortalLayout>
    );
  }

  if (isLoading) {
    return (
      <PortalLayout title="Child Fees">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Child Fees">
      <div className="space-y-6">
        {/* Fee Summary */}
        {feeSummaryData && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Fee Summary
              </h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-950">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Fees</p>
                  <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ${feeSummaryData.totalFees.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-lg bg-success-50 p-4 dark:bg-success-950">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Paid</p>
                  <p className="mt-1 text-2xl font-bold text-success-600 dark:text-success-400">
                    ${feeSummaryData.totalPaid.toFixed(2)}
                  </p>
                </div>

                <div
                  className={`rounded-lg p-4 ${
                    feeSummaryData.outstandingBalance > 0
                      ? 'bg-danger-50 dark:bg-danger-950'
                      : 'bg-success-50 dark:bg-success-950'
                  }`}
                >
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Outstanding Balance
                  </p>
                  <p
                    className={`mt-1 text-2xl font-bold ${
                      feeSummaryData.outstandingBalance > 0
                        ? 'text-danger-600 dark:text-danger-400'
                        : 'text-success-600 dark:text-success-400'
                    }`}
                  >
                    ${feeSummaryData.outstandingBalance.toFixed(2)}
                  </p>
                </div>
              </div>

              {feeSummaryData.outstandingBalance > 0 && (
                <div className="rounded-lg border-l-4 border-danger-500 bg-danger-50 p-4 dark:bg-danger-950">
                  <p className="text-sm font-medium text-danger-700 dark:text-danger-200">
                    ⚠️ Outstanding balance of ${feeSummaryData.outstandingBalance.toFixed(2)}
                    is due. Please make payment at your earliest convenience.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search fees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 pl-10 pr-4 py-2 dark:border-neutral-600 dark:bg-neutral-800"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Dropdown
                options={[
                  { value: 'paid', label: 'Paid' },
                  { value: 'partial', label: 'Partial' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'overdue', label: 'Overdue' },
                ]}
                value={selectedStatus}
                onChange={(value: string | number) => setSelectedStatus(String(value))}
                placeholder="All statuses"
              />

              <Dropdown
                options={[
                  { value: '2024', label: '2024' },
                  { value: '2023', label: '2023' },
                ]}
                value={selectedYear}
                onChange={(value: string | number) => setSelectedYear(String(value))}
                placeholder="All years"
              />
            </div>
          </div>
        </Card>

        {/* Fees Table */}
        {filteredFees.length > 0 ? (
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Fees ({filteredFees.length})
              </h3>

              <DataTable columns={feeColumns} data={filteredFees} pageSize={10} />
            </div>
          </Card>
        ) : (
          <Card className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400">No fees found</p>
          </Card>
        )}

        {/* Payment Instructions */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Payment Instructions
            </h3>

            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <p>• Fees can be paid online through the school portal or at the school office</p>
              <p>• Please keep payment receipts for your records</p>
              <p>• Contact the school office for payment plan options if needed</p>
              <p>• Late payments may incur additional charges</p>
            </div>

            <Button variant="primary" className="w-full">
              Make Payment
            </Button>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default ChildFeesPage;
