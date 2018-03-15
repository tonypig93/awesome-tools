var NavBar = React.createClass({
    displayName: "NavBar",
    render: function () {
        return (
        React.createElement("nav", { className: "navbar navbar-default", role: "navigation" },
            React.createElement("div", { className: "container-fluid" },
                React.createElement("div", { className: "navbar-header" },
                    React.createElement("a", { className: "navbar-brand", href: "#" }, "FS开金库")
                ),
                React.createElement("div", null,
                    React.createElement("ul", { className: "nav navbar-nav pull-right" },
                        React.createElement("li", null, React.createElement("a", { href: "#" }, "作者：Tony Zhu")),
                        React.createElement("li", null, React.createElement("a", { href: "http://tieba.baidu.com/home/main?un=zhuhuitonfg", target: "_blank" }, "贴吧ID：拖泥猪"))
                    )
                )
            )
        )
    );
    }
});
var InputNum = React.createClass({
    displayName: "InputNum",
    getInitialState: function () {
        return { num: '' };
    },
    handleChange: function (e) {
        this.setState({ num: e.target.value });
    },
    handleInput: function () {
        var _b = parseInt(this.props.bit);
        if (this.state.num.length >= _b - 1) {
            EventEmitter.dispatch('input' + _b);
        }
    },
    componentDidMount: function () {
        var $this = this;
        if (this.props.bit === '1') {
            EventEmitter.subscribe('input4', function (data) {
                $this.refs.myInput.focus();
            });
        } else if (!this.props.bit) {
            EventEmitter.subscribe('input1', function (data) {
                $this.refs.myInput.focus();
            });
        } else if (this.props.bit === '4') {
            $this.refs.myInput.focus();
            EventEmitter.subscribe('input0', function (data) {
                $this.refs.myInput.focus();
            });
        }
    },
    render: function () {
        return (
            React.createElement("div", { className: this.props.cls },
                React.createElement("label", null, this.props.title),
                React.createElement("input", { type: "number", ref: "myInput", className: "form-control", onInput: this.handleInput, value: this.state.num, onChange: this.handleChange })
            )
        );
    }
});
var EventEmitter = {
    _events: {},
    dispatch: function (event, data) {
        if (!this._events[event]) {
            return;
        }
        for (var i = 0; i < this._events[event].length; i++) {
            this._events[event][i](data);
        }
    },
    subscribe: function (event, callback) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(callback);
    }
};
var InputBtn = React.createClass({
    displayName: "InputBtn",
    handleClick: function () {
        this.props.handleClick();
    },
    render: function () {
        return (
            React.createElement("div", { className: "col-md-2" },
                React.createElement("label", null, " "),
                React.createElement("input", { type: "button", className: this.props.cls, value: this.props.title, onClick: this.handleClick })
            )
        );
    }
});
var InputRow = React.createClass({
    displayName: "InputRow",
    handleClick: function () {
        var _num = this.refs.num1.state.num,
            _res1 = parseInt(this.refs.num2.state.num),
            _res2 = parseInt(this.refs.num3.state.num);
        if (isNaN(parseInt(_num)) || isNaN(_res1) || isNaN(_res2)) {
            alert('请输入正确的整数');
            return false;
        }
        EventEmitter.dispatch('btnClick', { _num: _num, _res1: _res1, _res2: _res2 });
        this.refs.num1.setState({ num: '' });
        this.refs.num2.setState({ num: '' });
        this.refs.num3.setState({ num: '' });
        EventEmitter.dispatch('input0');
    },
    handleRefresh: function () {
        EventEmitter.dispatch('refresh');
        this.refs.num1.setState({ num: '' });
        this.refs.num2.setState({ num: '' });
        this.refs.num3.setState({ num: '' });
        EventEmitter.dispatch('input0');
    },
    render: function () {
        return (
        React.createElement("div", { className: "row", style: { marginBottom: "20px" } },
            React.createElement(InputNum, { ref: "num1", bit: "4", cls: "col-md-4", title: "猜的数字" }),
            React.createElement(InputNum, { ref: "num2", bit: "1", cls: "col-md-2", title: "数字对 位置对" }),
            React.createElement(InputNum, { ref: "num3", cls: "col-md-2", title: "数字对 位置不对" }),
            React.createElement(InputBtn, { title: "确定", cls: "form-control btn btn-success", handleClick: this.handleClick }),
            React.createElement(InputBtn, { title: "重置", cls: "form-control btn btn-primary", handleClick: this.handleRefresh })
        )
        );
    }
});

var ResultPanel = React.createClass({
    displayName: "ResultPanel",
    getInitialState: function () {
        var _list = this.getEnum();
        return { item: _list.length, round: 0, data: _list, record: [], mycls: 'hidden' };
    },
    getEnum: function () {
        var list = [],
            num = [0, 0, 0, 0];
        for (var i = 0; i < 10; i += 1) {
            num[0] = i;
            for (var j = 0; j < 10; j += 1) {
                if (j !== i) {
                    num[1] = j;
                    for (var k = 0; k < 10; k += 1) {
                        if (k !== i && k !== j) {
                            num[2] = k;
                            for (var m = 0; m < 10; m += 1) {
                                if (m !== i && m !== j && m !== k) {
                                    num[3] = m;
                                    list.push(num.toString().replace(/,/g, ''));
                                }
                            }
                        }
                    }
                }
            }
        }
        return list;
    },
    componentDidMount: function () {
        var $this = this;
        EventEmitter.subscribe('btnClick', function (data) {
            var _list = [];
            for (var i = 0, max = $this.state.data.length; i < max; i += 1) {
                if ($this.judge(parseInt(data._num), parseInt($this.state.data[i]), data._res1, data._res2)) {
                    _list.push($this.state.data[i]);
                }
            }
            $this.setState({ data: _list, item: _list.length, round: ++$this.state.round, record: $this.state.record.concat([[data._num, data._res1, data._res2, _list.length]]) });
        });
        EventEmitter.subscribe('refresh', function (data) {
            var _list = $this.getEnum();
            $this.setState({ data: _list, item: _list.length, round: 0, record: [] });
        });
        setTimeout(this.updateAlipay, 0);
    },
    updateAlipay: function(){
        this.setState({ mycls: '' });
    },
    judge: function (n1, n2, r2, r1) {
        var num1 = [],
            num2 = [],
            visit = [],
            count = 0;
        num1[0] = Math.floor(n1 / 1000);
        num1[1] = Math.floor((n1 % 1000) / 100);
        num1[2] = Math.floor((n1 % 100) / 10);
        num1[3] = Math.floor(n1 % 10);

        num2[0] = Math.floor(n2 / 1000);
        num2[1] = Math.floor((n2 % 1000) / 100);
        num2[2] = Math.floor((n2 % 100) / 10);
        num2[3] = Math.floor(n2 % 10);

        for (var i = 0; i < 4; i += 1) {
            if (num1[i] === num2[i])
                count++;
        }
        if (count !== r2) {
            return false;
        }
        count = 0;
        for (var i = 0; i < 4; i += 1) {
            for (var j = 0; j < 4; j += 1) {
                if (num1[i] === num2[j] && !visit[j]) {
                    visit[j] = 1;
                    count++;
                    break;
                }
            }
        }
        if ((count - r2) !== r1) {
            return false;
        }
        return true;
    },
    handleClick: function () {
        this.setState({ mycls: 'hidden' });
    },
    render: function () {
        return (
            React.createElement("div", { className: "row" },
                React.createElement("div", { className: "col-md-8" },
                    React.createElement("div", { className: "panel panel-primary" },
                        React.createElement("div", { className: "panel-heading" },
                            "枚举结果", React.createElement("span", { style: { marginLeft: "10px" } }, this.state.item), "项", React.createElement("span", { style: { marginLeft: "10px" } }, "当前第", React.createElement("span", null, this.state.round), "轮")
                        ),
                        React.createElement("div", { className: "panel-body" },
                            React.createElement(ResultList, { data: this.state.data })
                        )
                    )
                ),
                React.createElement("div", { className: "col-md-4" },
                    React.createElement("div", { className: "panel panel-primary" },
                        React.createElement("div", { className: "panel-heading" },
                            "输入记录"
                        ),
                        React.createElement("div", { className: "panel-body" },
                            React.createElement(RecordList, { data: this.state.record })
                        )
                    ),
                    React.createElement("div", { className: 'panel panel-primary ' + this.state.mycls },
                    React.createElement("div", { className: "panel-heading" },
                        "支付宝扫码"
                    ),
                    React.createElement("div", { className: "panel-body" },
                        React.createElement("img", { src: "./pay.jpg", alt: "alipay", className: "img-responsive" }),
                        React.createElement("div", null, "打赏赞助，感谢支持~", React.createElement("span", { className: "pull-right" }))
                    )
                )
                )
            )
        )
    }
});
var ResultList = React.createClass({
    displayName: "ResultList",
    render: function () {
        var resultNodes = this.props.data.map(function (node) {
            return (
                React.createElement("li", null, node)
            )
        });
        return (
            React.createElement("ul", { className: "list-inline" },
                resultNodes
            )
        )
    }
});
var RecordList = React.createClass({
    displayName: "RecordList",
    render: function () {
        var resultNodes = this.props.data.map(function (node) {
            return (
                React.createElement("tr", null,
                React.createElement("td", null, node[0]),
                React.createElement("td", null, node[1]),
                React.createElement("td", null, node[2]),
                React.createElement("td", null, node[3] + '个')
                )
            )
        });
        return (
            React.createElement("table", { className: "table table-striped" },
            React.createElement("thead", null,
                React.createElement("tr", null,
                React.createElement("td", null, "数字"),
                React.createElement("td", null, "全对"),
                React.createElement("td", null, "半对"),
                React.createElement("td", null, "剩余")
                )
            ),
            React.createElement("tbody", null,
        resultNodes
            )
            )
        )
    }
});
var Container = React.createClass({
    displayName: "Container",
    render: function () {
        return (
            React.createElement("div", { className: "container" },
                React.createElement(InputRow, null),
                React.createElement(ResultPanel, null)
            )
        );
    }
});
var Page = React.createClass({
    displayName: "Page",
    render: function () {
        return (
            React.createElement("div", null,
                React.createElement(NavBar, null),
                React.createElement(Container, null)
            )
        )
    }
});
ReactDOM.render(
React.createElement(Page, null),
document.getElementById('enum')
)