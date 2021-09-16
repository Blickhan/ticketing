import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // We are on the server
    // local dev baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local'
    return axios.create({
      baseURL: 'http://www.jbticketz.xyz/',
      headers: req.headers,
    });
  } else {
    // We are on the browser
    return axios.create({
      baseURL: '/',
    });
  }
};

export default buildClient;
