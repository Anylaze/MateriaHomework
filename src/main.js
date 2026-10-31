<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>作业看板</title>
    <link href="https://fonts.cdnfonts.com/css/google-sans" rel="stylesheet">
    <link rel="icon" href="./assets/favicon_512x.png" type="image/png">
    <style>
        root {
            --task-scale: 1;
            --homework-panel-opacity: 1;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Google Sans', 'Product Sans', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
            height: 100vh;
            width: 100vw;
            background-color: var(--s-color-background, #fce4e4);
            background-image: url('assets/default.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            overflow: hidden;
            color: var(--s-color-on-background, #3E1914);
        }

        .loading-modal {
            position: fixed;
            background-color: var(--s-color-background, #f8f9fb);
            color: var(--s-color-on-background, #3E1914);
            top: 0px;
            left: 0px;
            opacity: 100;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            z-index: 114514;
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .loading-modal.fade-out {
            opacity: 0;
            visibility: hidden;
        }

        .controls {
            position: absolute;
            bottom: 25px;
            left: 25px;
            z-index: 1000;
            display: flex;
            gap: 12px;
        }

        .opacity-slider-panel {
            position: fixed;
            left: 50%;
            bottom: 24px;
            transform: translateX(-50%);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 18px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.18);
            border: 1px solid rgba(255, 255, 255, 0.22);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: var(--s-color-on-surface, #3E1914);
        }

        .opacity-slider-label {
            font-size: 0.9rem;
            font-weight: 600;
            white-space: nowrap;
            color: var(--s-color-on-surface, #3E1914);
        }

        .opacity-slider-panel input[type="range"] {
            width: 180px;
            accent-color: var(--s-color-primary, #9C4F4F);
            cursor: pointer;
        }

        .opacity-preview-btn {
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: rgba(255, 255, 255, 0.2);
            color: var(--s-color-on-surface, #3E1914);
            border-radius: 999px;
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            padding: 8px 12px;
            min-width: 72px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .opacity-preview-btn:hover {
            transform: translateY(-1px);
            filter: brightness(1.03);
        }

        .opacity-preview-btn.active {
            background: var(--s-color-primary, #9C4F4F);
            color: var(--s-color-on-primary, #fff);
            border-color: transparent;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.14);
        }

        .custom-images {
            position: absolute;
            top: 20px;
            left: 20px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            z-index: 999;
            max-height: calc(100vh - 100px);
            overflow-y: hidden;
        }

        .custom-images div img {
            cursor: pointer;
            transition: transform 0.2s ease, opacity 0.2s ease;
            opacity: 1;
            width: auto;
            height: auto;
            max-width: none;
            border: none;
        }

        .custom-images div img.fade-out {
            opacity: 0!important;
        }

        .container {
            display: flex;
            width: 100vw;
            height: 100vh;
            padding: 4vh 4vw;
            gap: 4vw;
            position: relative;
            z-index: 2;
        }

        .left-panel {
            flex: 0 0 30%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .clock {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-weight: bold;
            color: var(--on-wallpaper-color, var(--s-color-primary, #FFA3B1));
            line-height: 0.85;
            text-shadow: 2px 4px 12px rgba(0, 0, 0, 0.08);
        }

        .hours, .minutes { font-size: 15vw; letter-spacing: -2px; }

        .date {
            margin-top: 2vh;
            font-size: 1.8vw;
            font-weight: bold;
            letter-spacing: 2px;
            color: var(--on-wallpaper-color, var(--s-color-primary, #FFA3B1));
        }

        .right-panel {
            overflow: hidden;
            width: 100%;
            opacity: var(--homework-panel-opacity, 1);
            transition: opacity 0.2s ease;
        }

        .task-item {
            background-color: var(--s-color-surface-variant, #FAE4E7);
            border-radius: calc(50px * var(--task-scale));
            padding: calc(10px * var(--task-scale)) calc(20px * var(--task-scale)) calc(10px * var(--task-scale)) calc(10px * var(--task-scale));
            display: flex;
            position: relative;
            margin-top: calc(10px * var(--task-scale));
            margin-bottom: calc(10px * var(--task-scale));
            transition: background-color 0.3s ease, transform 0.3s;
            animation: fadeIn 0.4s ease forwards;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            min-height: 0;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .subject-tag {
            background-color: var(--s-color-tertiary-container, #FCE0C6);
            border-radius: calc(35px * var(--task-scale));
            padding: calc(12px * var(--task-scale)) calc(25px * var(--task-scale));
            display: flex;
            align-items: center;
            max-height: calc(70px * var(--task-scale));
            gap: calc(12px * var(--task-scale));
            flex-shrink: 0;
            color: var(--s-color-on-tertiary-container, #444465);
            font-weight: bold;
            font-size: calc(30px * var(--task-scale));
            margin-right: calc(20px * var(--task-scale));
            z-index: 100;
        }

        .icon-svg {
            display: inline-block;
            fill: currentColor;
            width: auto;
            height: 1.2em;
            vertical-align: middle;
        }

        .subject-tag .icon-svg {
            height: 1.2em;
            width: auto;
        }

        .task-content {
            flex: 1;
            height: auto;
            min-height:0;
            outline: none;
            align-self: stretch;  
            color: var(--s-color-on-surface-variant, #40484C);
            font-size: calc(40px * var(--task-scale));
            line-height: 1.32;
            font-weight: bold;
            overflow-wrap: anywhere;  
            white-space: pre-wrap;
            cursor: text;
        }

        .task-content[contenteditable="true"]:empty:before {
            content: "点击编辑...";
            color: rgba(62, 25, 20, 0.3);
            pointer-events: none;
        }

        .delete-btn {
            background: var(--s-color-error-container, #FFDAD6);
            border: none;
            color: var(--s-color-on-error-container, #93000A);
            width: calc(40px * var(--task-scale));
            height: calc(40px * var(--task-scale));
            border-radius: 50%;
            cursor: pointer;
            font-size: calc(24px * var(--task-scale));
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: calc(10px * var(--task-scale));
            margin-top: calc(8px * var(--task-scale));
            opacity: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
            flex-shrink: 0;
            z-index: 99999;
        }

        .delete-btn:hover { background: var(--s-color-error, #BA1A1A); color: var(--s-color-on-error, #fff); transform: scale(1.1); }
        .task-item:hover .delete-btn { opacity: 1; }

        .restore-panel {
            position: fixed;
            bottom: 30px;
            right: 30px;
            display: flex;
            flex-direction: row-reverse;
            gap: 16px;
            z-index: 1000;
            flex-wrap: nowrap;
            pointer-events: none;
        }

        .restore-panel .restore-btn {
            pointer-events: auto;
        }

        .primary-btn {
            width: 58px;
            height: 58px;
            background-color: var(--s-color-tertiary-container, #FCE0C6);
            display: flex;
            border-radius:50%;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 6px 14px rgba(0,0,0,0.2);
            border: 1px solid transparent;
            transition: background-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
            position: relative;
            color: var(--s-color-on-tertiary-container, #444465);
        }

        .primary-btn .icon-svg {
            width: 34px;
            height: 34px;
        }

        .primary-btn::before {
            content: attr(data-name);
            position: absolute;
            top: -42px;
            background-color: rgba(40, 25, 20, 0.85);
            color: #fff9f0;
            padding: 6px 16px;
            border-radius: 40px;
            font-size: 14px;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s;
            transform: translateY(10px);
        }

        p {
            margin: 0;
            padding: 0;
        }

        .primary-btn:hover::before {
            opacity: 1;
        }

        s-page {
            background-color: rgba(255, 0, 0, 0);
        }

        .scrim {
            position: fixed;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            background-color: var(--s-color-background, #f8f9fb);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .iframe-bg-layer {
            position: fixed;
            inset: 0;
            z-index: 0;
            overflow: hidden;
            pointer-events: none;
            contain: layout paint;
        }

        .iframe-bg-layer[hidden] {
            display: none;
        }

        .iframe-bg-frame {
            display: block;
            width: 100%;
            height: 100%;
            border: 0;
            background: transparent;
        }

        body.capturing .iframe-bg-layer {
            visibility: hidden;
        }

        .grid {
            grid-template-columns: minmax(100px, auto) minmax(100px, auto);
        }

        #rich-editor {
            height: 240px;
            width: 650px;
        }

        #rich-editor .ql-container {
            height: 100%;
            min-height: 100%;
            border: none;
            background: transparent;
        }

        #rich-editor .ql-editor {
            height: 100%;
            width: 100%;
            min-height: 100%;
            padding: 0;
        }

        #rich-editor,
        #rich-editor {
            outline: none !important;
            box-shadow: none !important;
            font-size: 38px;
            -webkit-tap-highlight-color: transparent;
        }

        #rich-editor {
            outline: none !important;
            box-shadow: none !important;
        }

        .quick-text-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }

        .quick-text-bar[hidden] {
            display: none;
        }

        .quick-text-bar > s-badge.quick-text-badge {
            width: auto !important;
            height: auto !important;
            min-width: 0 !important;
            min-height: 0 !important;
            background: var(--s-color-secondary-container, #E8DEF8) !important;
            color: var(--s-color-on-secondary-container, #1D192B) !important;
            font-size: 0.8125rem !important;
            cursor: pointer;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            transition: filter 0.15s ease, transform 0.12s ease;
        }

        .quick-text-bar > s-badge.quick-text-badge:hover {
            filter: brightness(0.94);
        }

        .quick-text-bar > s-badge.quick-text-badge::part(text) {
            height: 24px !important;
            padding: 0 10px !important;
            border-radius: 12px !important;
            font-size: 0.8125rem !important;
            line-height: 1 !important;
        }

        .quick-text-bar > s-badge.quick-text-badge:active {
            transform: scale(0.94);
        }

        .quick-text-bar > s-badge.quick-text-badge:focus-visible {
            outline: 2px solid var(--s-color-primary, #9C4F4F);
            outline-offset: 2px;
        }

        html.theme-transition s-page,
        html.theme-transition body,
        html.theme-transition .clock,
        html.theme-transition .date,
        html.theme-transition .task-item,
        html.theme-transition .subject-tag,
        html.theme-transition .task-content,
        html.theme-transition .primary-btn,
        html.theme-transition .primary-btn::before,
        html.theme-transition .restore-panel,
        html.theme-transition .scrim {
            transition: opacity 520ms cubic-bezier(0.2, 0, 0, 1) !important;
        }

        html.theme-transition .iframe-bg-layer {
            transition:
                background-color 520ms cubic-bezier(0.2, 0, 0, 1),
                color 520ms cubic-bezier(0.2, 0, 0, 1),
                border-color 520ms cubic-bezier(0.2, 0, 0, 1),
                outline-color 520ms cubic-bezier(0.2, 0, 0, 1),
                fill 520ms cubic-bezier(0.2, 0, 0, 1),
                stroke 520ms cubic-bezier(0.2, 0, 0, 1) !important;
        }

        @media (prefers-reduced-motion: reduce) {
            html.theme-transition s-page,
            html.theme-transition body,
            html.theme-transition .clock,
            html.theme-transition .date,
            html.theme-transition .task-item,
            html.theme-transition .subject-tag,
            html.theme-transition .task-content,
            html.theme-transition .primary-btn,
            html.theme-transition .primary-btn::before,
            html.theme-transition .restore-panel,
            html.theme-transition .scrim,
            html.theme-transition .iframe-bg-layer {
                transition: none !important;
            }
        }
    </style>
</head>
<body>
    <s-page style="background-color: rgba(255, 0, 0, 0)">
        <div class="scrim" aria-hidden="true"></div>
        <div class="loading-modal">
            <h1>正在加载</h1>
            <span id="version-info"></span>
            <br>
            <s-circular-progress indeterminate="true"></s-circular-progress>
        </div>
        <input type="file" id="bg-input" accept="image/*" style="display:none">
        <input type="file" id="img-input" accept="image/*" multiple style="display:none">

        <div class="controls">
            <s-popup-menu>
                <button id="bg-change-btn" class="primary-btn" data-name="更换背景" slot="trigger">
                    <span class="icon-mask" style="--icon-url: url('assets/image.svg')" aria-hidden="true"></span>
                    <s-ripple attached="true"></s-ripple>
                </button>
                <s-popup-menu-item id="bg-image-item">
                    <s-icon slot="start" src="assets/image.svg"></s-icon>
                    选择本地图片
                </s-popup-menu-item>
                <s-popup-menu-item id="bg-iframe-item">
                    <s-icon slot="start" src="assets/iframe.svg"></s-icon>
                    使用 iframe 网页
                </s-popup-menu-item>
            </s-popup-menu>
            <s-popup-menu>
                <button id="theme-mode-btn" class="primary-btn" data-name="显示模式" slot="trigger">
                    <span class="icon-mask" style="--icon-url: url('assets/theme.svg')" aria-hidden="true"></span>
                    <s-ripple attached="true"></s-ripple>
                </button>
                <s-popup-menu-item id="theme-mode-color">
                    <span class="theme-mode-label">跟随取色</span>
                </s-popup-menu-item>
                <s-popup-menu-item id="theme-mode-auto">
                    <span class="theme-mode-label">跟随系统</span>
                </s-popup-menu-item>
                <s-popup-menu-item id="theme-mode-light">
                    <span class="theme-mode-label">始终浅色</span>
                </s-popup-menu-item>
                <s-popup-menu-item id="theme-mode-dark">
                    <span class="theme-mode-label">始终深色</span>
                </s-popup-menu-item>
            </s-popup-menu>
            <button id="img-add-btn" class="primary-btn" data-name="添加图片">
                <span class="icon-mask" style="--icon-url: url('assets/add.svg')" aria-hidden="true"></span>
                <s-ripple attached="true"></s-ripple>
            </button>
            <button id="full-screen-btn" class="primary-btn" data-name="切换全屏">
                <span class="icon-mask" style="--icon-url: url('assets/full.svg')" aria-hidden="true"></span>
                <s-ripple attached="true"></s-ripple>
            </button>
            <s-popup-menu>
                <button id="clear-all-btn" class="primary-btn" data-name="清除/重置" slot="trigger">                
                <span class="icon-mask" style="--icon-url: url('assets/clear.svg')" aria-hidden="true"></span>
                <s-ripple attached="true"></s-ripple></button>
                <s-popup-menu-item onclick="resetPic();setTimeout(location.reload.bind(location), 1000);">清除图片</s-popup-menu-item>
                <s-popup-menu-item onclick="document.getElementById('reset-content-dialog').showed = true;">重置作业</s-popup-menu-item>
            </s-popup-menu>
            <button id="save-btn" class="primary-btn" data-name="保存图片">
                <span class="icon-mask" style="--icon-url: url('assets/save.svg')" aria-hidden="true"></span>
                <s-ripple attached="true"></s-ripple>
            </button>
            <button id="manage-subject-btn" class="primary-btn" data-name="编辑科目">
                <span class="icon-mask" style="--icon-url: url('assets/edit.svg')" aria-hidden="true"></span>
                <s-ripple attached="true"></s-ripple>
            </button>
        </div>

        <div class="opacity-slider-panel" aria-label="作业栏透明度调节">
            <button id="homework-opacity-preview" class="opacity-preview-btn" type="button" aria-label="预览透明度效果">预览</button>
            <label class="opacity-slider-label" for="homework-opacity">透明度</label>
            <input id="homework-opacity" type="range" min="0.2" max="1" step="0.05" value="1" aria-label="作业栏透明度">
        </div>

        <div class="custom-images" id="custom-images-container"></div>

        <div class="container">
            <div class="left-panel">
                <div class="clock">
                    <div class="hours" id="hours">--</div>
                    <div class="minutes" id="minutes">--</div>
                    <div class="date" id="date">--</div>
                </div>
            </div>

            <div class="right-panel" id="task-list"></div>
        </div>

        <div class="restore-panel" id="restore-panel"></div>

        <s-dialog id="text-edit-panel">
            <div slot="headline"> 富文本编辑器 </div>
            <div slot="text" style="width:100%; max-height: 60vh; display: flex; flex-direction: column;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; align-items: center;">
                    <s-icon-button id="bold-btn" title="加粗">
                        <s-icon src="/assets/bold.svg"></s-icon>
                    </s-icon-button>
                    <s-icon-button id="size-increase-btn" title="增大字号">
                        <s-icon src="/assets/size-increase.svg"></s-icon>
                    </s-icon-button>
                    <s-icon-button id="size-decrease-btn" title="减小字号">
                        <s-icon src="/assets/size-decrease.svg"></s-icon>
                    </s-icon-button>
                    <s-icon-button id="add-image-btn" title="插入图片">
                        <s-icon src="/assets/image.svg"></s-icon>
                    </s-icon-button>
                    <s-picker label="选择字体..." id="font-picker">
                        <s-picker-item value="">默认字体</s-picker-item>
                        <s-picker-item value="SimSun">宋体</s-picker-item>
                        <s-picker-item value="SimHei">黑体</s-picker-item>
                        <s-picker-item value="Microsoft YaHei">微软雅黑</s-picker-item>
                        <s-picker-item value="KaiTi">楷体</s-picker-item>
                        <s-picker-item value="FangSong">仿宋</s-picker-item>
                        <s-picker-item value="Arial">Arial</s-picker-item>
                        <s-picker-item value="Times New Roman">Times New Roman</s-picker-item>
                    </s-picker>
                    <s-picker label="字体颜色..." id="color-picker">
                        <s-picker-item value="">默认颜色</s-picker-item>
                        <s-picker-item value="#000000">黑色</s-picker-item>
                        <s-picker-item value="#D32F2F">红色</s-picker-item>
                        <s-picker-item value="#1976D2">蓝色</s-picker-item>
                        <s-picker-item value="#388E3C">绿色</s-picker-item>
                        <s-picker-item value="#F57C00">橙色</s-picker-item>
                        <s-picker-item value="#7B1FA2">紫色</s-picker-item>
                        <s-picker-item value="#616161">灰色</s-picker-item>
                    </s-picker>
                </div>
                <div class="quick-text-bar" id="quick-text-bar" role="toolbar" aria-label="快捷文字"></div>
                <s-field style="height:250px; width:650px;">
                    <div slot="label">请输入内容</div>
                    <div id="rich-editor"></div>
                </s-field>
            </div>
            <s-button slot="action" type="text" id="text-edit-cancel">取消</s-button>
            <s-button slot="action" type="text" id="text-edit-confirm">确定</s-button>
        </s-dialog>

        <s-dialog id="reset-content-dialog">
            <div slot="headline"> 提示 </div>
            <div slot="text">将会清空所有科目的作业内容，并保留科目配置（名称/图标/排序/隐藏状态等）。是否继续？
            </div>
            <s-button slot="action" type="text">取消</s-button>
            <s-button slot="action" type="text" style="color:#FF0000;" onclick="resetContent();">确定</s-button>
        </s-dialog>

        <s-dialog id="subject-manage-dialog" size="standard">
            <div slot="headline">科目管理</div>
            <div slot="text">
                <div id="subject-list-container" style="display: flex; flex-direction: column; gap: 8px; max-height: 50vh; overflow-y: auto; padding: 12px 0;">
                </div>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--s-color-outline, #ccc);">
                    <s-button id="add-subject-btn" type="filled" style="width: 100%;">
                        <s-icon slot="start" src="assets/add.svg"></s-icon>
                        添加新科目
                    </s-button>
                </div>
            </div>
            <s-button slot="action" type="text" id="subject-manage-close">关闭</s-button>
        </s-dialog>

        <s-dialog id="add-subject-dialog">
            <div slot="headline">添加科目</div>
            <div slot="text" style="display: flex; flex-direction: column; gap: 12px;">
                <s-text-field id="new-subject-name" label="科目名称" placeholder="输入科目名称"></s-text-field>
                <s-picker id="new-subject-icon" label="选择图标">
                    <s-picker-item value="assets/chinese.svg">语文</s-picker-item>
                    <s-picker-item value="assets/mathematics.svg">数学</s-picker-item>
                    <s-picker-item value="assets/english.svg">英语</s-picker-item>
                    <s-picker-item value="assets/physics.svg">物理</s-picker-item>
                    <s-picker-item value="assets/chemistry.svg">化学</s-picker-item>
                    <s-picker-item value="assets/biology.svg">生物</s-picker-item>
                    <s-picker-item value="assets/history.svg">历史</s-picker-item>
                    <s-picker-item value="assets/politics.svg">政治</s-picker-item>
                    <s-picker-item value="assets/geography.svg">地理</s-picker-item>
                </s-picker>
            </div>
            <s-button slot="action" type="text" id="add-subject-cancel">取消</s-button>
            <s-button slot="action" type="text" id="add-subject-confirm">确定</s-button>
        </s-dialog>

        <s-dialog id="iframe-bg-dialog">
            <div slot="headline">iframe 背景</div>
            <div slot="text" style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                <div style="font-size: 0.875rem; line-height: 1.6; opacity: 0.85;">
                    填写一个网页地址，它会作为看板背景显示（背景层不拦截鼠标操作）。<br>
                    支持 <code>https://</code> 网址，也支持 <code>/</code>、<code>./</code> 开头的站内路径。
                </div>
                <s-text-field id="iframe-bg-url" label="iframe 地址" placeholder="https://example.com/bg.html"></s-text-field>
                <div style="font-size: 0.8125rem; line-height: 1.6; opacity: 0.85;">
                    背景页引入 <code>iframe-bg-sdk.js</code> 后，调用
                    <code>MateriaBackground.repick('#6750A4')</code> 可按指定颜色取色，
                    调用 <code>MateriaBackground.repickFromImage(图片)</code>
                    则可把图片直接交给看板取色。
                    <button
                        type="button"
                        id="iframe-bg-demo"
                        style="border: none; background: none; padding: 0; font: inherit; color: var(--s-color-primary, #6750A4); text-decoration: underline; cursor: pointer;"
                    >填入内置示例 ./iframe-bg-demo.html</button>
                </div>
            </div>
            <s-button slot="action" type="text" id="iframe-bg-clear">清除</s-button>
            <s-button slot="action" type="text" id="iframe-bg-cancel">取消</s-button>
            <s-button slot="action" type="text" id="iframe-bg-confirm">应用</s-button>
        </s-dialog>

        <script type="module" src="./src/main.js"></script>
    </s-page>
</body>
</html>

