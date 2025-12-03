import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const logData = localStorage.getItem('logData');
  if(logData !== null) {
    const token = JSON.parse(logData).token;
    const newReqData = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    return next(newReqData);
  } else {
    return next(req);
  }
};
