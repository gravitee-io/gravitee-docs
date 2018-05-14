### Frequently asked questions
1. Can Gravitee add HTTPs support to http-only API ? **Yes**
2. Can APIM proxy an https-enabled API ? **Yes**
3. Is the internal API managing APIM queryable by developpers to publish a new API by script (for API ongoing/on-fly integration) ? **Yes**
4. Is SAML protocol supported by Gravitee project ? **Could be with on-fly transformation of client's SAML query if its OAuth implementation includes ? [RFC link](https://tools.ietf.org/html/draft-ietf-oauth-saml2-bearer-17#section-2.2)**
6. Is backend services call orchestration supported by Gravitee ?
**Not natively, but could be with a dedicated policy involving dynamic routing ?**
7. Could be restricted what is seen on the UI per consumer ? **Yes**
8. Could be restricted what API services are available per consumer ? **Yes**
9. What degree of security does Gravitee have ? **Gravitee integrates Jetty web server which provides for protection against attacks like deny of services.**
10. Does Gravitee support Web Sockets ? **Could be as Jetty implements Web Sockets Protocol**
11. Does Gravitee have a cache system ? **Yes, the cache system is per user and per backend service and is powered by Ehcache.**

Warning : This FAQ is community made and there is no warranty it is error free.
