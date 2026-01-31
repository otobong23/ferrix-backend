import * as React from 'react';

interface TransactionStatusEmailProps {
  email: string;
  transactionId: string;
  amount?: number | string;
  type: string;
  coin?: string;
  timestamp?: string;
  status: 'approved' | 'declined';
  reason?: string; // For declined transactions
  processingTime?: string; // For approved transactions
}

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    margin: 0,
    padding: '20px',
    minHeight: '100vh',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1a365d',
    color: '#ffffff',
    padding: '20px',
    textAlign: 'center' as 'center',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  tagline: {
    fontSize: '0.9rem',
    opacity: 0.9,
  },
  content: {
    padding: '30px',
  },
  // Success alert for approved
  successBanner: {
    backgroundColor: '#d1fae5',
    border: '1px solid #34d399',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
  },
  // Error alert for declined
  errorBanner: {
    backgroundColor: '#fee2e2',
    border: '1px solid #f87171',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
  },
  alertIcon: {
    marginRight: '10px',
    fontSize: '1.2rem',
  },
  successText: {
    color: '#065f46',
    fontWeight: '600',
    margin: 0,
  },
  errorText: {
    color: '#dc2626',
    fontWeight: '600',
    margin: 0,
  },
  greeting: {
    fontSize: '1.1rem',
    color: '#2d3748',
    marginBottom: '20px',
  },
  transactionCard: {
    backgroundColor: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  approvedCard: {
    backgroundColor: '#f0fdf4',
    border: '2px solid #bbf7d0',
  },
  declinedCard: {
    backgroundColor: '#fef2f2',
    border: '2px solid #fecaca',
  },
  transactionTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '15px',
    textAlign: 'center' as 'center',
  },
  transactionDetails: {
    display: 'grid',
    gap: '12px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#4a5568',
  },
  detailValue: {
    color: '#2d3748',
    fontWeight: '500',
  },
  transactionId: {
    backgroundColor: '#edf2f7',
    padding: '12px',
    borderRadius: '6px',
    fontFamily: 'monospace',
    fontSize: '1rem',
    fontWeight: 'bold',
    textAlign: 'center' as 'center',
    color: '#2d3748',
    marginBottom: '15px',
  },
  statusBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '0.9rem',
    textAlign: 'center' as 'center',
    marginBottom: '15px',
  },
  approvedBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
  declinedBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  reasonSection: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '20px',
  },
  reasonTitle: {
    color: '#92400e',
    fontWeight: '600',
    marginBottom: '8px',
    fontSize: '1rem',
  },
  reasonText: {
    color: '#78350f',
    margin: 0,
    lineHeight: '1.5',
  },
  nextStepsSection: {
    backgroundColor: '#e0f2fe',
    border: '1px solid #0ea5e9',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '20px',
  },
  nextStepsTitle: {
    color: '#0c4a6e',
    fontWeight: '600',
    marginBottom: '8px',
    fontSize: '1rem',
  },
  nextStepsList: {
    color: '#075985',
    margin: 0,
    paddingLeft: '20px',
  },
  actionSection: {
    textAlign: 'center' as 'center',
    marginTop: '25px',
  },
  actionButton: {
    backgroundColor: '#3182ce',
    color: '#ffffff',
    padding: '12px 30px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    display: 'inline-block',
    margin: '0 10px 10px 10px',
  },
  successButton: {
    backgroundColor: '#059669',
    color: '#ffffff',
    padding: '12px 30px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    display: 'inline-block',
    margin: '0 10px 10px 10px',
  },
  secondaryButton: {
    backgroundColor: '#718096',
    color: '#ffffff',
    padding: '12px 30px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    display: 'inline-block',
    margin: '0 10px 10px 10px',
  },
  footer: {
    backgroundColor: '#edf2f7',
    padding: '20px',
    textAlign: 'center' as 'center',
    fontSize: '0.85rem',
    color: '#718096',
  },
  footerText: {
    margin: '5px 0',
  },
};

const TransactionStatusEmail: React.FC<TransactionStatusEmailProps> = ({ 
  email, 
  transactionId,
  amount = "Amount not specified",
  type,
  coin = "USDT",
  timestamp = new Date().toLocaleString(),
  status,
  reason,
  processingTime = "5-10 minutes"
}) => {
  const dashboard = 'https://www.novox.app/dashboard';
  const transactions = 'https://www.novox.app/dashboard/tiering/transactions';
  const support = 'https://www.novox.app/dashboard/support';

  const isApproved = status === 'approved';
  const isDeclined = status === 'declined';

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>Novox</div>
          <div style={styles.tagline}>Peer-to-Peer Trading Platform</div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Status Banner */}
          {isApproved && (
            <div style={styles.successBanner}>
              <span style={styles.alertIcon}>✅</span>
              <p style={styles.successText}>Transaction Approved Successfully!</p>
            </div>
          )}

          {isDeclined && (
            <div style={styles.errorBanner}>
              <span style={styles.alertIcon}>❌</span>
              <p style={styles.errorText}>Transaction Declined</p>
            </div>
          )}

          {/* Greeting */}
          <p style={styles.greeting}>
            Dear {email.split('@')[0]},
          </p>

          {/* Status Message */}
          <p style={{ fontSize: '1rem', color: '#2d3748', marginBottom: '20px', lineHeight: '1.6' }}>
            {isApproved 
              ? `We're pleased to inform you that your ${type.toLowerCase()} transaction has been approved and processed successfully.`
              : `We regret to inform you that your ${type.toLowerCase()} transaction has been declined after review.`
            }
          </p>

          {/* Transaction Card */}
          <div style={{
            ...styles.transactionCard,
            ...(isApproved ? styles.approvedCard : styles.declinedCard)
          }}>
            <h2 style={styles.transactionTitle}>
              {isApproved ? '✅ Transaction Approved' : '❌ Transaction Declined'}
            </h2>
            
            <div style={styles.transactionId}>
              ID: {transactionId}
            </div>

            <div style={{
              ...styles.statusBadge,
              ...(isApproved ? styles.approvedBadge : styles.declinedBadge)
            }}>
              {isApproved ? '🎉 APPROVED' : '⚠️ DECLINED'}
            </div>

            <div style={styles.transactionDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Type:</span>
                <span style={styles.detailValue}>{type} {coin}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Amount:</span>
                <span style={styles.detailValue}>{amount} {coin}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Submitted:</span>
                <span style={styles.detailValue}>{timestamp}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status:</span>
                <span style={styles.detailValue}>
                  {isApproved ? '✅ Approved' : '❌ Declined'}
                </span>
              </div>
              {isApproved && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Processing Time:</span>
                  <span style={styles.detailValue}>{processingTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reason for Decline */}
          {isDeclined && reason && (
            <div style={styles.reasonSection}>
              <p style={styles.reasonTitle}>📋 Reason for Decline:</p>
              <p style={styles.reasonText}>{reason}</p>
            </div>
          )}

          {/* Next Steps */}
          {isApproved && (
            <div style={styles.nextStepsSection}>
              <p style={styles.nextStepsTitle}>📝 What happens next:</p>
              <ul style={styles.nextStepsList}>
                <li>Your transaction will be processed within {processingTime}</li>
                <li>You'll receive a confirmation once the funds are transferred</li>
                <li>You can track the progress in your dashboard</li>
              </ul>
            </div>
          )}

          {isDeclined && (
            <div style={styles.nextStepsSection}>
              <p style={styles.nextStepsTitle}>🔄 Next Steps:</p>
              <ul style={styles.nextStepsList}>
                <li>Review the decline reason above</li>
                <li>You can submit a new transaction with correct information</li>
                <li>Contact support if you need assistance</li>
                <li>Check our help center for transaction guidelines</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.actionSection}>
            {isApproved && (
              <a href={dashboard} style={styles.successButton}>
                📊 View Dashboard
              </a>
            )}
            <a href={transactions} style={styles.actionButton}>
              📋 Transaction History
            </a>
            {isDeclined && (
              <a href={support} style={styles.secondaryButton}>
                💬 Contact Support
              </a>
            )}
          </div>

          <p style={{ fontSize: '0.9rem', color: '#718096', textAlign: 'center', marginTop: '20px' }}>
            {isApproved 
              ? 'Thank you for using Novox. We appreciate your business!'
              : 'We apologize for any inconvenience. Please don\'t hesitate to reach out if you have questions.'
            }
          </p>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            <strong>Novox Trading Platform</strong>
          </p>
          <p style={styles.footerText}>
            Modern P2P Bitcoin & Cryptocurrency Exchange
          </p>
          <p style={styles.footerText}>
            This is an automated notification. Please do not reply to this email.
          </p>
          <p style={styles.footerText}>
            Need help? Visit our support center or contact us directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatusEmail;
