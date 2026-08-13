
# Ambiente de desenvolvimento

- **Devcontainers**: Está sendo utilizado um devcontainer com _pnpm_ para o desenvolvimento isolado do resto sistema operacional no VSCode

## Conhecendo melhor o problema

1. Configurei testes com o vitest e passei os exemplos para a pasta assets e criei testes para assegurar de que poderia importá-los.
2. Experimentei diferentes bibliotecas de extração de texto:
    1. `@pdflib/core`: Não é claro na documentação como extrair os elementos do PDF
    2. `@dvvebond/core`: Um fork do `@pdflib/core` que se propoe a extrair elementos mas a documentação está desatualizada
    3. **`pdf-oxide-wasm`**: Melhor até agora

3. Verifiquei onde estavam localizados os dados que deveria extrar os PDF's 
    1. Os **verbas** e as **bases** são localizados cada um em um lugar
        - payroll-01: verbas em uma coluna à esquerda e bases à direita
        - payroll-02: verbas em uma tabela, bases em texto à baixo
        - payroll-03: verbas na parte superior da tabela e bases na parte inferior
        - payroll-04: verbas à esquerda e bases à direita

4. Com testes de unidade extraí os textos de cada um dos holerítes e ferifiquei como foram apresentados verbas e bases
    - **payroll-01**:
      Todas os **verbas** são apresentados em sequencia. Após "Fls.:" são apresentadas as bases.

      Esse PDF já evidencia um problema no retorno esperado de **holerite**:
      o holetite deve apresentar uma lista de páginas onde cada página possui 1 campo para ano, 1 para mês, 1 para campos e 1 para bases. **Porém na mesma página são apresentados diversos meses de forma compácta**. Terei que tratar cada mes/ano como uma página para manter a coerência dos dados de `fields` e `bases`.

      Alguns dos campos das verbas mostram 2 valores como: `Hr Adic Pericul`. O primeiro valor é a quantidade de horas (referência) enquanto o segundo valor é o adicional em reais (valor)

      - **Ano e mês**:
        Apresentado junto com verbas    

      - **Verbas**:
        > Folha Normal
          Mês: abr-17
          REMUNERAÇÃOMES 969,73 290 VA Funcionario
          DIAS/HORASTRAB 146,67 491 Seguro Vida Fun
          40 Reembolso VR 0,00 360,00 499 Vale Ref Func
          91 Hr Adic Pericul 146,67 290,92 511 INSS Normal
          TOT.RENDIMENTOS 1.620,65 561 IRF Normal
          820 Vale Transp Fun TOTALDESCONTOS
      
      - **Bases**:
        > 0 30,67 BASEDECALCULODOINSS 1.260,65
          0 2,40 BASEDECALCULODOIRF 780,62
          0 36,00 BASEDECALCULODOFGTS 1.260,65
          0 100,85 VALORDOFGTS 100,85
          0 0,00 SALARIOLIQUIDONOMES 1.392,55
          0 58,18 VALORDOIRFARECOLHER 0,00
          228,10 VALORDOIRFARECOLHER 0,00


        > 0 46,00 BASEDECALCULODOINSS 2.064,79
          0 756,39 BASEDECALCULODOIRF 1.499,78
          0 2,40 BASEDECALCULODOFGTS 2.064,79
          22 66,00 VALORDOFGTS 165,18
          0 185,83 SALARIOLIQUIDONOMES 916,64
          0 0,00 VALORDOIRFARECOLHER 0,00
          0 4,25 VALORDOIRFARECOLHER 0,00
          0 87,28
          1.148,15

      "Vale Transp Fun" e "TOTALDESCONTOS" aparecem apenas com seus títulos em **verbas**
      enquanto seus valores aparecem em **bases**

    - **payroll-02**:
      Verbas e bases são apresentadas na mesma tabela. Bases à esquerda e verbas à direita.

      Também é importante notar que nesse holeríte tem tabelas do mês e de acertos por página no mesmo mês, eles devem ser agrupados

      - **Ano e mês**:
        > Funcionário:
          Mês/Ano: 08/2018 Folha de Pagamento: MÊS

      - **Verbas e bases**:
        > 010 VENCIMENTO PADRAO-VP 3.059,94
          011 ADICIONAL POR MERITO 602,14
          191 ABF-ADIC.BASICO DE FUNCAO 1.896,19
          192 ATFC-AD.TEMP.FATORES/COMI 630,36
          803 PREVI PESSOAL PB2 6.188,63 -433,20
          807 PREVI PES.MENSAL PB2-2B 6.188,63 -61,88
          821 CONTR. TEMPORARIA - CASSI 6.188,63 -61,88
          822 CASSI PESSOAL 6.188,63 -185,65
          830 INSS-CONTR.PESSOAL 5.645,80 -621,03
          875 IMPOSTO DE RENDA-FONTE 4.882,93 -473,44

    - **payroll-03**:
      Verbas e bases são apresentadas junto aqui separados por
      > Total 1.967,07 859,46
        Líqüido 1.107,61

      - **Ano e mês**:
        > Período : 10/2019 Data Pagto: 31.10.2019 06.12.2024 11:11:52 Pág: 1

      - **Verbas**
        > Cod. Descrição Unidade Proventos Descontos
          0105 Dias Trabalhados 30,00 1.678,61
          2007 Horas Extras 100% 5,00 76,30
          2027 Horas Extras 100% Noturna 2,92 47,40
          2040 Ad. Noturno 20% 70,16 107,06
          2100 DSR sobre Variaveis 26,77
          2102 DSR sobre H.Extra 30,93
          /314 Contr. INSS Remuneração 9,00 177,03
          /B02 Adiantamento pago 671,44
          4039 Conv. Odonto. (S. Franc.) 10,99
          Total 1.967,07 859,46
          Líqüido 1.107,61

      - **Bases**:
        > Base I.N.S.S. : 1.967,07 F.G.T.S. do Mês : 157,37
          Base I.R.R.F. : 1.790,04 Base I.R.R.F. 13o.:
          Dep. I.R.R.F. : 0,00 Base FGTS: 1.967,07

    - **payroll-04**:
      Todas as páginas são imagens

    Os **payrolls 2 e 4** não apresentam valores de referência, apenas verba e base

5. Verifiquei os nomes comuns entre **bases**, **verbas** e **totais**
    - **Verbas** não parecem apresentar qualquer semelhança entre um documento e outro
    - **Bases**: apresentam muitos campos em comum mas não da para ter qualquer garantia de como cada base poderá se chamar.

## Estratégia

### Estratégia inicial

**nome** é seguido de **no máximo 2 valores** antes da próxima string. Esses valores podem representar:
  - Referência e valor (pr-1 e pr-3), no caso de pr-3 proventos e descontos são mutuamente exclusivos.
    - Para essas payrolls, as bases possuem apenas **1 valor seguido do nome da base**
  - Base e valor (pr-2), nesse caso a referencia é sempre ""

Não lidaremos com imagens ainda.

Visto que as quebras de linha ao extrair o texto plano do PDF não ajuda a associar os nomes com os valores, para o primeiro Payroll tudo entre uma "Folha Normal" e outra será concatenado e tratado com uma unica linha agrupando valores de acordo com as regras definidas anteriormente

Ao obter todo o texto do documento por linhas, é possível identificar que entre cada uma das tabelas há um padrão, uma linha que se repete pelo menos parcialmente para iniciar ou finalizar uma região:

- **Abertura**
  - payroll-01: "Mês: ..."
  - payroll-02: "Verba Nome Base / Saldo / Benefício Valor"
  - payroll-03: "Cod. Descrição Unidade Proventos Descontos"

- **Fechamento**:
  - payroll-01: "Folha Normal"
  - payroll-02: "Remuneração, Função, Vl., ..."
  - payroll-03: "Assinado eletronicamente por: ..."

Na leitura das linhas pode ou não haver um código antes do nome da verba, para contornar esse problema basta ler de trás para frente respeitando a regra de máximo de 2 valores

### Estratégia aprimorada

Da mesma forma como a posição foi utilizada para determinar quais palavras estão na mesma linha, algo semelhante pode ser feito para verificar se estão na mesma coluna. Um conjunto de dados que compartilham linhas e colunas compõe uma tabela, basta então discriminar o que essa tabela representa.