import * as React from 'react';

interface HelpMessageProps {
  name: string;
  email: string;
  message: string;
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
    textAlign: 'center' as const,
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
    backgroundColor: '#e0f2fe',
    border: '1px solid #38bdf8',
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
    color: '#075985',
    fontWeight: '600',
    margin: 0,
  },
  greeting: {
    fontSize: '1.1rem',
    color: '#2d3748',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '15px',
    textAlign: 'center' as const,
  },
  details: {
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
    textAlign: 'right' as const,
    maxWidth: '60%',
    wordBreak: 'break-word' as const,
  },
  messageBox: {
    marginTop: '15px',
    backgroundColor: '#edf2f7',
    padding: '15px',
    borderRadius: '6px',
    fontSize: '0.95rem',
    color: '#2d3748',
    whiteSpace: 'pre-wrap' as const,
  },
  actionSection: {
    textAlign: 'center' as const,
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
  footer: {
    backgroundColor: '#edf2f7',
    padding: '20px',
    textAlign: 'center' as const,
    fontSize: '0.85rem',
    color: '#718096',
  },
  footerText: {
    margin: '5px 0',
  },
};

const HelpMessageMail: React.FC<HelpMessageProps> = ({
  name,
  email,
  message,
  timestamp = new Date().toLocaleString(),
}) => {
  const dashboard = 'https://www.ferrix.app/admin/dashboard';

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>Ferrix</div>
          <div style={styles.tagline}>Support Notification</div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Alert Banner */}
          <div style={styles.alertBanner}>
            <span style={styles.alertIcon}>📩</span>
            <p style={styles.alertText}>New User Help Message</p>
          </div>

          <p style={styles.greeting}>Hello Admin,</p>

          {/* Help Message Card */}
          <div style={styles.card}>
            <h2 style={styles.title}>🆘 Support Request</h2>

            <div style={styles.details}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Name:</span>
                <span style={styles.detailValue}>{name}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Email:</span>
                <span style={styles.detailValue}>{email}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Timestamp:</span>
                <span style={styles.detailValue}>{timestamp}</span>
              </div>
            </div>

            <div style={styles.messageBox}>
              {message}
            </div>
          </div>

          {/* Action */}
          <div style={styles.actionSection}>
            <a href={dashboard} style={styles.actionButton}>
              📊 Go to Admin Dashboard
            </a>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#718096', textAlign: 'center', marginTop: '20px' }}>
            Please respond to this user as soon as possible.
          </p>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            <strong>Ferrix Trading Platform</strong>
          </p>
          <p style={styles.footerText}>
            This is an automated support notification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpMessageMail;