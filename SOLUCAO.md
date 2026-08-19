# O que ficou de fora

- Cartão de ponto
    - Por que ficou de fora?
        Acabei gastando todo meu tempo em resolver a extração de tabelas do PDF
    - Como eu resolveria:
        Utilizaria a mesma extração de tabelas mas atribuiria diferentes responsabilidades às colunas

- Correção das tabelas
    - Por que ficou de fora?
        Acabei gastando todo meu tempo em resolver a extração de tabelas do PDF, priorizei a implementação do frontend para os ultimos 2 dias.

    - Como eu resolveria:
        Bastaria re-enviar todos os dados para o backend e substituílos no banco de dados

- Configuração do transcritor
    - Por que ficou de fora?
        Acabei gastando todo meu tempo em resolver a extração de tabelas do PDF, priorizei a implementação do frontend para os ultimos 2 dias. Ainda houvesse tempo além disso priorizaria a correção direta das tabelas
    
    - Como eu resolveria:
        Um formulário com os valores de configuração para meu detector de tabelas permitiria ao usuário tentar novas extrações com diferentes parâmetros antes de ter que corrigir manualmente.

- Download das planilhas
    - Por que ficou de fora?
        Acabei gastando todo meu tempo em resolver a extração de tabelas do PDF
    - Como eu resolveria:
        Basta converter os dados em JSON que já tenho no servidor

# Como executar

- Há uma versão executando online: https://desafio-programador-ten.vercel.app:
    porém provavelmente pela capacidade do free tier da vercel, o PDF nunca é transcrito.

Docker compose:
    `docker compose up --build`

Diretamente:
    Basta definir uma variável de ambiente para um banco postgresql: `POSTGRESQL_PRISMA_DATABASE_URL`
    E executar com seu package manager de preferência (npm, pnpm, yarn...)

