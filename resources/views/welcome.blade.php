<!DOCTYPE html>
<html ng-app="Sandbox">
<head lang="en">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="UTF-8">
    <title>Sandbox</title>
    <link href="/css/app.css" rel="stylesheet" />
    <base href="/" />
</head>
<body>

<div digest-count></div>

<div ui-view="navbar"></div>
<div ui-view="jumbotron"></div>
<div ui-view="subnav"></div>
<ui-view></ui-view>

<script src="/js/global.js"></script>
<script src="/js/app.js"></script>
<script src="/js/templates.js"></script>
</body>
</html>