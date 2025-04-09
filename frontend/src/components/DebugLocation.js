import { useLocation } from 'react-router-dom';

const DebugLocation = () => {
  const location = useLocation();
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        padding: '5px 10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        fontSize: '0.9rem',
        zIndex: 1000,
      }}
    >
      Current Path: {location.pathname}
    </div>
  );
};

export default DebugLocation;
