# 開発環境
OSはUbuntuを想定しています。vm上で動くminikubeだとファイル共有などが大変なのでmicrok8sを使います。

## 必要なソフトのインストール
以下の解説を見てskaffold・kubectl・microk8sをインストールします。

* https://skaffold.dev/docs/install/
* https://kubernetes.io/docs/tasks/tools/install-kubectl/
* https://microk8s.io/docs/

## kubectlでmicrok8sを使う設定

```sh
$ microk8s.kubectl config view --raw > ~/.kube/microk8s.config
$ echo "export KUBECONFIG=\$HOME/.kube/config" >> ~/.bashrc
$ echo "export KUBECONFIG=\$KUBECONFIG:\$HOME/.kube/microk8s.config" >> ~/.bashrc
$ kubectl config use-context microk8s
```
## microk8sのregistryを使う設定

```sh
$ microk8s enable registry
$ skaffold config set default-repo 127.0.0.1:32000
$ vim /var/snap/microk8s/current/args/containerd-template.toml # https://microk8s.io/docs/registry-private
$ microk8s stop
$ microk8s start
```

## 起動
```sh
$ cp .config.sample .config
$ cp .secret.sample .secret
# edit
$ make load-env
$ skaffold dev --port-forward
# localhost:3000
```

## ボリューム
`/data/anontown`に永続化されています。
