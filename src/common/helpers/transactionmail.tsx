import * as React from 'react';

interface EmailTemplateProps {
  email: string;
  transactionId: string;
  amount?: number | string;
  type: string;
  coin?: string;
  timestamp?: string;
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
  alertBanner: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
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
  alertText: {
    color: '#92400e',
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
  urgency: {
    backgroundColor: '#fed7d7',
    border: '1px solid #fc8181',
    borderRadius: '6px',
    padding: '12px',
    textAlign: 'center' as 'center',
    marginBottom: '20px',
  },
  urgencyText: {
    color: '#c53030',
    fontWeight: '600',
    margin: 0,
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

const TransactionMail: React.FC<EmailTemplateProps> = ({ 
  email, 
  transactionId,
  amount = "Amount not specified",
  type,
  coin = "USDT",
  timestamp = new Date().toLocaleString()
}) => {
  const review = 'https://www.novox.app/admin/transactions'
  const dashboard = 'https://www.novox.app/admin/dashboard'
  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>Novox</div>
          <div style={styles.tagline}>Verified Trading Platform</div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Alert Banner */}
          <div style={styles.alertBanner}>
            <span style={styles.alertIcon}>⚠️</span>
            <p style={styles.alertText}>Admin Action Required - Transaction Review</p>
          </div>

          {/* Greeting */}
          <p style={styles.greeting}>
            Hello Admin,
          </p>

          {/* Transaction Card */}
          <div style={styles.transactionCard}>
            <h2 style={styles.transactionTitle}>📥 Incoming Transaction</h2>
            
            <div style={styles.transactionId}>
              ID: {transactionId}
            </div>

            <div style={styles.transactionDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>User:</span>
                <span style={styles.detailValue}>{email}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Type:</span>
                <span style={styles.detailValue}>{type} {coin}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Amount:</span>
                <span style={styles.detailValue}>{amount} {coin}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Timestamp:</span>
                <span style={styles.detailValue}>{timestamp}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status:</span>
                <span style={styles.detailValue}>⏳ Pending Review</span>
              </div>
            </div>
          </div>

          {/* Urgency Notice */}
          {/* <div style={styles.urgency}>
            <p style={styles.urgencyText}>
              ⏰ This transaction expires in 10 minutes
            </p>
          </div> */}

          {/* Action Buttons */}
          <div style={styles.actionSection}>
            <a href={review} style={styles.actionButton}>
              🔍 Review Transaction
            </a>
            <a href={dashboard} style={styles.secondaryButton}>
              📊 View Dashboard
            </a>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#718096', textAlign: 'center', marginTop: '20px' }}>
            Please review this transaction promptly to ensure smooth processing for our users.
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
        </div>
      </div>
    </div>
  );
};

export default TransactionMail;
