# 西语落地页发布基线恢复说明

本说明对应发布标签：`release/spanish-peru-colombia-2026-07-15`。

桌面备份目录会同时提供两种恢复介质：

- `chixiang-motor-website-spanish-landings-2026-07-15.bundle`：保留 Git 历史和发布标签；推荐给熟悉 Git 的维护者。
- `chixiang-motor-website-spanish-landings-2026-07-15.zip`：完整静态源码快照；用于人工对比或紧急取回文件。

## 使用 Git bundle 恢复（推荐）

不要覆盖现有工作目录。新建一个空目录后执行：

```powershell
git clone "C:\Users\97020\Desktop\驰翔摩托_西语落地页备份_2026-07-15\chixiang-motor-website-spanish-landings-2026-07-15.bundle" restored-site
Set-Location restored-site
git switch release/spanish-peru-colombia-2026-07-15
node --test tests/*.test.js
```

确认无误后，把需要恢复的文件以新的功能分支提交；不要复制整个目录覆盖生产工作区。

## 从发布标签恢复已上线站点

若确认需要把线上站点恢复到该基线，在干净的仓库中执行：

```powershell
git switch main
git pull --ff-only
git revert <需要撤销的发布提交SHA>
git push origin main
```

如果后续有多个发布提交，请逐个 `git revert`，不要使用强推、`reset --hard` 或删除历史。

## 恢复后必须验证

```powershell
node --test tests/*.test.js
git diff --check
```

并检查：

- `https://chixiangmotor.com/es/peru/`
- `https://chixiangmotor.com/es/colombia/`
- 表单、Turnstile、WhatsApp 和移动端 CTA。
