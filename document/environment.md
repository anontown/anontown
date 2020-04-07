# 環境構築

## 推奨OS

* Ubuntu

## 必要ソフト

* skaffold
* kubectl
* microk8s
  * ローカルのk8s環境としてmicrok8sを推奨していますがminikubeなどでも基本的に動きます。
  * このドキュメントではmicrok8sを前提に解説します。
* node
  * あったほうが効率的な開発ができます

## skaffoldのインストール

* https://skaffold.dev/docs/install

## kubectlのインストール

* https://kubernetes.io/docs/tasks/tools/install-kubectl/

## microk8sのインストール

`1. Install MicroK8s`, `2. Join the group`が必要です。

* https://microk8s.io/docs/

## kubectlでmicrok8sを使う設定

```sh
$ microk8s.kubectl config view --raw > ~/.kube/microk8s.config
$ echo "export KUBECONFIG=\$HOME/.kube/config" >> ~/.bashrc
$ echo "export KUBECONFIG=\$KUBECONFIG:\$HOME/.kube/microk8s.config" >> ~/.bashrc
$ kubectl config use-context microk8s
```
## microk8sのregistry有効化など

```sh
$ microk8s enable registry
$ skaffold config set default-repo 127.0.0.1:32000
$ vim /var/snap/microk8s/current/args/containerd-template.toml # see: https://microk8s.io/docs/registry-private
$ microk8s stop
$ microk8s start
```

## microk8sのdns有効化
```sh
$ microk8s enable dns
```
