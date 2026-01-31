import * as React from 'react';

interface EmailTemplateProps {
  username: string;
  code?: string;
}

const styles = {
  body: {
    display: 'flex' as 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    minHeight: '100vh',
    backgroundColor: '#fff',
  },
  container: {
    textAlign: 'center' as 'center',
    paddingBlock: '20px'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  icon: {
    width: '150px',
    margin: '20px auto',
  },
  h1: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  p: {
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  a: {
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};
const EmailTemplate: React.FC<EmailTemplateProps> = ({ username, code }) => {
  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={styles.logo}>
          <img src='https://res.cloudinary.com/dxet6crme/image/upload/v1748654965/Frame-2_egfoww.svg' alt="logo Icon" style={styles.icon} />
        </div>
        {/* <img src={mail_image} alt="Envelope Icon" style={styles.icon} /> */}
        <h1 style={styles.h1}>Hi! {username}</h1>
        <p style={styles.p}><a href="https://novox.app/">Welcome to Novox</a></p>
        <p style={styles.p}>
          Novox is a trading company where you can be a part of the peer-to-peer exchange community worldwide. Using modern business methods and person-to-person client approach, we offer a unique investment model to traders of bitcoin and other methods.
        </p>
        <p style={styles.p}>Reset Code</p>
        <h1 style={styles.h1}>{code}</h1>
        <p style={styles.p}>This Code Expires in 10 Minutes</p>
      </div>
    </div>
  );
};

export default EmailTemplate;
