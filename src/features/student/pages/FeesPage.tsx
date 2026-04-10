import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Card } from '@components/molecules/Card';
import { DataTable, Column } from '@components/organisms/DataTable';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { Spinner } from '@components/atoms/Spinner';
import { useDebounce } from '@hooks/useDebounce';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { studentService } from '@services/api/studentService';
import type { Fee } from '@types';

/**
 * Student Fees Page
 * Displays student fees with filtering, payment history, and fee summary
 * - Table view on desktop, card layout on mobile
 * - Filter by status, academic year, and term
 * - Red warning indicator for overdue fees
 * - Fee summary with total fees, paid, and outstanding balance
 * - Payment initiation button for each fee
 * - Payment history view
 */

interface FeeSummary {
  totalFees: number;
  totalPaid: number;
  outstandingBalance: number;
}

export const FeesPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // State
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [initiatingPayment, setInitiatingPayment] = useState<string | null>(null);

  // Mock payment history data
  const paymentHistory = [
    { id: '1', method: 'Bank Transfer', date: '2024-01-15', amount: 50000 },
    { id: '2', method: 'Card Payment', date: '2024-02-10', amount: 50000 },
  ];

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load fees data
  useEffect(() => {
    const loadFees = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch fees with filters
        const response = await studentService.getFees({
          status: selectedStatus || undefined,
          academicYear: selectedYear || undefined,
          term: selectedTerm || undefined,
        });

        setFees(response.data || []);

        // Fetch fee summary
        const summary = await studentService.getFeeSummary();
        setFeeSummary(summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fees');
      } finally {
        setLoading(false);
      }
    };

    loadFees();
  }, [selectedStatus, selectedYear, selectedTerm]);

  // Filter and search fees
  const filteredFees = useMemo(() => {
    let result = [...fees];

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((fee) => fee.title.toLowerCase().includes(query));
    }

    // Apply sorting
    if (sortKey && sortDirection) {
      result.sort((a, b) => {
        let aVal: any = a[sortKey as keyof Fee];
        let bVal: any = b[sortKey as keyof Fee];

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal as string).toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [fees, debouncedSearchQuery, sortKey, sortDirection]);

  // Get unique academic years and terms
  const academicYears = useMemo(() => {
    const years = new Set(fees.map((f) => f.academicYear));
    return Array.from(years).sort().reverse();
  }, [fees]);

  const terms = useMemo(() => {
    const termsSet = new Set(fees.filter((f) => f.term).map((f) => f.term!));
    return Array.from(termsSet).sort();
  }, [fees]);

  // Calculate days overdue
  const getDaysOverdue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Check if fee is overdue
  const isOverdue = (fee: Fee): boolean => {
    return fee.status === 'overdue' || getDaysOverdue(fee.dueDate) > 0;
  };

  // Handle sort
  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedYear('');
    setSelectedTerm('');
    setSortKey(null);
    setSortDirection(null);
  }, []);

  // Handle payment initiation
  const handleInitiatePayment = async (feeId: string) => {
    try {
      setInitiatingPayment(feeId);
      // Call payment initiation API
      await studentService.initiateFeePayment(feeId);
      // In a real app, this would redirect to payment gateway
      alert('Payment initiated. Redirecting to payment gateway...');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setInitiatingPayment(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status badge variant
  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'info';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'danger';
      default:
        return 'info';
    }
  };

  // Table columns for desktop view
  const tableColumns: Column<Fee>[] = [
    {
      key: 'title',
      label: 'Fee Title',
      sortable: true,
      width: '25%',
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      width: '15%',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'paidAmount',
      label: 'Paid',
      sortable: true,
      width: '15%',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      width: '15%',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '15%',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {isOverdue(row) && <Icon name="AlertCircle" size={16} className="text-danger-600" />}
          <Badge variant={getStatusVariant(value)}>{value}</Badge>
        </div>
      ),
    },
    {
      key: 'id',
      label: 'Action',
      width: '15%',
      render: (value, row) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleInitiatePayment(value)}
          disabled={row.status === 'paid' || initiatingPayment === value}
          className="w-full"
        >
          {initiatingPayment === value ? 'Processing...' : 'Pay'}
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Fees" description="View your fee status and payment history">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Fees" description="View your fee status and payment history">
      <div className="space-y-6">
        {/* Fee Summary */}
        {feeSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-2">Total Fees</p>
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(feeSummary.totalFees)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-2">Total Paid</p>
                <p className="text-3xl font-bold text-success-600">
                  {formatCurrency(feeSummary.totalPaid)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-2">Outstanding Balance</p>
                <p
                  className={`text-3xl font-bold ${
                    feeSummary.outstandingBalance > 0 ? 'text-danger-600' : 'text-success-600'
                  }`}
                >
                  {formatCurrency(feeSummary.outstandingBalance)}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Payment History Toggle */}
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPaymentHistory(!showPaymentHistory)}
            className="flex items-center gap-2"
          >
            <Icon name={showPaymentHistory ? 'ChevronUp' : 'ChevronDown'} size={16} />
            {showPaymentHistory ? 'Hide' : 'Show'} Payment History
          </Button>
        </div>

        {/* Payment History */}
        {showPaymentHistory && (
          <Card>
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-900">Payment History</h3>
              {paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">{payment.method}</p>
                        <p className="text-sm text-neutral-600">
                          {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold text-success-600">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-600 text-center py-4">No payment history</p>
              )}
            </div>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Filters</h3>
              {(searchQuery || selectedStatus || selectedYear || selectedTerm) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2"
                >
                  <Icon name="X" size={16} />
                  Reset
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Search</label>
                <Input
                  type="text"
                  placeholder="Search by fee title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  aria-label="Search fees"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Filter by status"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Academic Year Filter */}
              {academicYears.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Academic Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Filter by academic year"
                  >
                    <option value="">All Years</option>
                    {academicYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Term Filter */}
              {terms.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Term</label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Filter by term"
                  >
                    <option value="">All Terms</option>
                    {terms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Fees Display */}
        {error ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="AlertCircle" size={32} className="text-danger-600 mx-auto mb-3" />
              <p className="text-danger-600 font-medium">{error}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={handleResetFilters}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : filteredFees.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="DollarSign" size={32} className="text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600">No fees found</p>
            </div>
          </Card>
        ) : isMobile ? (
          // Mobile: Card Layout
          <div className="space-y-3">
            {filteredFees.map((fee) => (
              <Card key={fee.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{fee.title}</h4>
                      <p className="text-sm text-neutral-600">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverdue(fee) && (
                        <Icon name="AlertCircle" size={20} className="text-danger-600" />
                      )}
                      <Badge variant={getStatusVariant(fee.status)}>{fee.status}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-neutral-600">Amount</p>
                      <p className="font-semibold text-neutral-900">{formatCurrency(fee.amount)}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Paid</p>
                      <p className="font-semibold text-success-600">
                        {formatCurrency(fee.paidAmount)}
                      </p>
                    </div>
                  </div>

                  {isOverdue(fee) && (
                    <div className="p-2 bg-danger-50 rounded-lg">
                      <p className="text-sm text-danger-700 font-medium">
                        ⚠️ Overdue by {getDaysOverdue(fee.dueDate)} days
                      </p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleInitiatePayment(fee.id)}
                    disabled={fee.status === 'paid' || initiatingPayment === fee.id}
                    className="w-full"
                  >
                    {initiatingPayment === fee.id ? 'Processing...' : 'Pay Now'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop: Table Layout
          <Card>
            <DataTable
              columns={tableColumns}
              data={filteredFees}
              onSort={handleSort}
              loading={loading}
              keyExtractor={(fee) => fee.id}
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FeesPage;
