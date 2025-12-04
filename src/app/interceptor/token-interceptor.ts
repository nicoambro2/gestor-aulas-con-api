import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const token = localStorage.getItem('logData');
  if(token !== null) {
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
