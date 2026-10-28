# Instrumentais HNL

Aplicativo Android e web para registro e devolução de instrumentais da Engenharia Clínica do Hospital Napoleão Laureano, com identidade visual do hospital e da TROM.

## O que está implementado

- Foto pela câmera ou galeria, nome, falha, técnico e setor opcional.
- Fotos e dados salvos em IndexedDB; rascunho automático e fila local de sincronização.
- Identificador local único; código definitivo **DDMMAAAA/001**, sequência diária atribuída pelo servidor sob bloqueio para evitar números repetidos entre celulares.
- Seleção dos itens sincronizados para entrega; conferência item a item **OK** ou **Não OK**. Motivo obrigatório para cada recusa.
- Conferência offline com identificação e assinatura manuscrita do técnico e da coordenadora, capturada com o dedo ou mouse. As duas assinaturas são obrigatórias para concluir e vinculadas por SHA-256 aos nomes, itens, setores e resultados. Alterar os dados exige nova assinatura. Não é certificado digital.
- PDF com somente a logo do hospital (sem a marca TROM), duas assinaturas, nomes e datas de captura, itens entregues/aprovados e retornados/recusados, incluindo motivos e indicação de sincronização pendente.
- Histórico, pesquisa, filtros, backup com fotos (sem chave de acesso), ícone e tela de abertura com caricaturas.
- Comunicação com o servidor institucional existente.
- Proteção contra envio repetido por UUID + hash. Conflitos de versões são recusados pelo servidor sem descartar a fila local.

## Integração institucional

A interface foi publicada no projeto institucional existente. O adaptador reutiliza a planilha vinculada, a pasta de fotos e a autenticação administrativa anterior. Os registros antigos são importados em abas novas sem apagar a aba original. A conferência local funciona offline; o envio das entregas exige sessão administrativa válida.

## Gerar e baixar o APK

1. Abra **Actions → Gerar APK Android** no GitHub.
2. Após a conclusão, abra a execução e baixe **Instrumentais-HNL-APK-teste** em **Artifacts**.
3. Descompacte o ZIP e instale `app-debug.apk` em um celular de teste.

O workflow é executado também em alterações de código na branch `main`. Ele exige permissões **Contents: Read and write** e **Workflows: Read and write** da integração usada para colocar os arquivos. A execução do job usa somente `contents: read`.

Este é um **APK de teste**, assinado com chave de desenvolvimento do ambiente de compilação. Atualizações de uma instalação para outra podem exigir reinstalação porque a chave de desenvolvimento não é estável entre runners. **Sincronize e exporte backup antes de desinstalar.** Para distribuição estável, configure uma chave de assinatura de produção protegida em GitHub Secrets; nunca inclua o arquivo de chave neste repositório.

## Servidor institucional

O servidor e o adaptador da planilha são mantidos exclusivamente no projeto institucional. Este repositório contém o aplicativo Android e a rotina de compilação. O endereço da aplicação institucional já está configurado no aplicativo; a senha não é publicada no código.

## Uso sem internet

- No APK, os arquivos do aplicativo estão dentro da instalação; ele pode abrir sem internet desde o primeiro uso.
- No Apps Script, mantenha a página já aberta para uso offline. Reabrir sem internet é uma função do APK. Não use modo anônimo para armazenar registros.
- Cadastros novos recebem uma identificação provisória até a sincronização confirmar o código definitivo. A data do código usa o momento do cadastro no fuso de São Paulo.
- Antes de sair para entregar, sincronize e prepare a seleção. A conferência e os motivos de recusa ficam salvos offline.
- Com internet e o aplicativo aberto, ele tenta enviar a fila ao detectar retorno de conexão. O botão **Sincronizar** confirma os envios manualmente. Não há promessa de sincronização com o aplicativo fechado.
- Só a confirmação válida do servidor remove uma operação da fila. Falhas e conflitos mantêm os dados no celular.
- A entrega finalizada não pode ser editada. Se houver conflito com outro dispositivo, preserve o termo e o backup para reconciliação pela coordenação; não force o envio por cima do registro oficial.
- Não limpe dados do navegador nem desinstale com registros pendentes. Backup exportado pode ser usado para recuperação assistida; não há importação automática pela interface nesta versão.

## Desenvolvimento e validação

```sh
npm ci
npm test
npm run build
npx cap add android
npx cap sync android
node scripts/android-assets.mjs
cd android
./gradlew assembleDebug
```

Node 22+, Java 21 e Android SDK compatível com Capacitor 8. `dist/` é a versão web compilada e `src/` contém o código-fonte. O workflow instala e compila essas dependências em um runner do GitHub.

Os testes verificam persistência, validação de recusas, narrativa singular/plural, confirmação de sincronização e conflitos no servidor simulado. A compilação Android e a comunicação com a planilha real precisam ser verificadas na execução do Actions e no celular; os testes de código não substituem esse teste integrado.

## Demonstração

Na tela de abertura, **Experimentar com dados fictícios** abre um armazenamento separado. São três instrumentais ilustrativos para testar a seleção, a aprovação, a recusa, a persistência e o termo. O modo de demonstração nunca envia dados à planilha e marca os documentos como sem validade. Para voltar, use **Sair da demonstração** na abertura ou em Configurações.

## Assinaturas e documento

As assinaturas são capturadas diretamente na tela. Elas ficam no rascunho da conferência e na fila offline junto com os resultados. A integração armazena os traços no evento oficial e exibe a data de captura nas colunas de assinatura da aba Entregas_App. Nenhuma imagem de assinatura é publicada em pasta aberta. O termo usa somente a logo do Hospital Napoleão Laureano; as logos do hospital e da TROM permanecem no aplicativo. O PDF de demonstração usa traços e nomes fictícios, marcados sem validade.
