import { useRef, useEffect } from 'react';

export function useTraceUpdate(props: any) {
  const prev = useRef(props);

  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps: any, [k, v]) => {
      // Check if the prop value has changed
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});

    // Only log if there are changed props
    if (Object.keys(changedProps).length > 0) {
      console.log('Changed props:', changedProps);
    }

    // Update previous props reference
    prev.current = props;
  });
}
