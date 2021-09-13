import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    const baseURL =
      process.env.NODE_ENV === 'production'
        ? 'http://www.jbticketz.xyz'
        : 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local';

    // We are on the server
    return axios.create({
      baseURL,
      headers: req.headers,
    });
  } else {
    // We are on the browser
    return axios.create();
  }
};

export default buildClient;
