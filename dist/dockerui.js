/*! dockerui - v0.1.0 - 2015-12-01
 * https://github.com/ashishbende/docker
 * Copyright (c) 2015 Ashish Bende;
 * Licensed MIT
 */
angular.module('dockerui', ['dockerui.templates', 'ngRoute', 'dockerui.services', 'dockerui.filters', 'masthead', 'footer', 'dashboard', 'container', 'containers', 'containersNetwork', 'images', 'image', 'pullImage', 'startContainer', 'sidebar', 'info', 'builder', 'containerLogs', 'containerTop', 'events', 'stats'])
    .config(['$routeProvider', function ($routeProvider) {
        'use strict';
        $routeProvider.when('/', {
            templateUrl: 'app/components/dashboard/dashboard.html',
            controller: 'DashboardController'
        });
        $routeProvider.when('/containers/', {
            templateUrl: 'app/components/containers/containers.html',
            controller: 'ContainersController'
        });
        $routeProvider.when('/containers/:id/', {
            templateUrl: 'app/components/container/container.html',
            controller: 'ContainerController'
        });
        $routeProvider.when('/containers/:id/logs/', {
            templateUrl: 'app/components/containerLogs/containerlogs.html',
            controller: 'ContainerLogsController'
        });
        $routeProvider.when('/containers/:id/top', {
            templateUrl: 'app/components/containerTop/containerTop.html',
            controller: 'ContainerTopController'
        });
        $routeProvider.when('/containers/:id/stats', {
            templateUrl: 'app/components/stats/stats.html',
            controller: 'StatsController'
        });
       /* $routeProvider.when('/containers_network', {
            templateUrl: 'app/components/containersNetwork/containersNetwork.html',
            controller: 'ContainersNetworkController'
        });*/
        $routeProvider.when('/images/', {
            templateUrl: 'app/components/images/images.html',
            controller: 'ImagesController'
        });
        $routeProvider.when('/images/:id*/', {
            templateUrl: 'app/components/image/image.html',
            controller: 'ImageController'
        });
        $routeProvider.when('/info', {templateUrl: 'app/components/info/info.html', controller: 'InfoController'});
        $routeProvider.when('/events', {
            templateUrl: 'app/components/events/events.html',
            controller: 'EventsController'
        });
        /*$routeProvider.when('/jenkins/', {
            templateUrl: 'app/components/jenkins/jenkins.html',
            controller: 'JenkinsController'
        });*/
        $routeProvider.otherwise({redirectTo: '/'});
    }])

    .constant('DOCKER_ENDPOINT', 'dockerapi')
    .constant('DOCKER_PORT', '') // Docker port, leave as an empty string if no port is requred.  If you have a port, prefix it with a ':' i.e. :4243
    .constant('UI_VERSION', 'v0.8.0')
    .constant('DOCKER_API_VERSION', 'v1.20');

angular.module('builder', [])
    .controller('BuilderController', ['$scope', 'Dockerfile', 'Messages',
        function ($scope, Dockerfile, Messages) {
            $scope.template = 'app/components/builder/builder.html';
        }]);

angular.module('container', [])
    .controller('ContainerController', ['$scope', '$routeParams', '$location', 'Container', 'ContainerCommit', 'Messages', 'ViewSpinner',
        function ($scope, $routeParams, $location, Container, ContainerCommit, Messages, ViewSpinner) {
            $scope.changes = [];
            $scope.edit = false;

            var update = function () {
                ViewSpinner.spin();
                Container.get({id: $routeParams.id}, function (d) {
                    $scope.container = d;
                    $scope.container.edit = false;
                    $scope.container.newContainerName = d.Name;
                    ViewSpinner.stop();
                }, function (e) {
                    if (e.status === 404) {
                        $('.detail').hide();
                        Messages.error("Not found", "Container not found.");
                    } else {
                        Messages.error("Failure", e.data);
                    }
                    ViewSpinner.stop();
                });
            };

            $scope.start = function () {
                ViewSpinner.spin();
                Container.start({
                    id: $scope.container.Id,
                    HostConfig: $scope.container.HostConfig
                }, function (d) {
                    update();
                    Messages.send("Container started", $routeParams.id);
                }, function (e) {
                    update();
                    Messages.error("Failure", "Container failed to start." + e.data);
                });
            };

            $scope.stop = function () {
                ViewSpinner.spin();
                Container.stop({id: $routeParams.id}, function (d) {
                    update();
                    Messages.send("Container stopped", $routeParams.id);
                }, function (e) {
                    update();
                    Messages.error("Failure", "Container failed to stop." + e.data);
                });
            };

            $scope.kill = function () {
                ViewSpinner.spin();
                Container.kill({id: $routeParams.id}, function (d) {
                    update();
                    Messages.send("Container killed", $routeParams.id);
                }, function (e) {
                    update();
                    Messages.error("Failure", "Container failed to die." + e.data);
                });
            };

            $scope.commit = function () {
                ViewSpinner.spin();
                ContainerCommit.commit({id: $routeParams.id, repo: $scope.container.Config.Image}, function (d) {
                    update();
                    Messages.send("Container commited", $routeParams.id);
                }, function (e) {
                    update();
                    Messages.error("Failure", "Container failed to commit." + e.data);
                });
            };
            $scope.pause = function () {
                ViewSpinner.spin();
                Container.pause({id: $routeParams.id}, function (d) {
                    update();
                    Messages.send("Container paused", $routeParams.id);
                }, function (e) {
                    update();
                    Messages.error("Failure", "Container failed to pause." + e.data);
                });
            };

            $scope.unpause = function () {
                ViewSpinner.spin();
                Container.unpause({id: $routeParams.id}, function (d) {
                    update();
                    Messages.send("Container unpaused", $routeParams.id);
                }, function (e) {
                    update();
                    Messages.error("Failure", "Container failed to unpause." + e.data);
                });
            };

            $scope.remove = function () {
                ViewSpinner.spin();
                Container.remove({id: $routeParams.id}, function (d) {
                    update();
                    Messages.send("Container removed", $routeParams.id);
                }, function (e) {
                    update();
                    Messages.error("Failure", "Container failed to remove." + e.data);
                });
            };

            $scope.restart = function () {
                ViewSpinner.spin();
                Container.restart({id: $routeParams.id}, function (d) {
                    update();
                    Messages.send("Container restarted", $routeParams.id);
                }, function (e) {
                    update();
                    Messages.error("Failure", "Container failed to restart." + e.data);
                });
            };

            $scope.hasContent = function (data) {
                return data !== null && data !== undefined;
            };

            $scope.getChanges = function () {
                ViewSpinner.spin();
                Container.changes({id: $routeParams.id}, function (d) {
                    $scope.changes = d;
                    ViewSpinner.stop();
                });
            };

            $scope.renameContainer = function () {
                // #FIXME fix me later to handle http status to show the correct error message
                Container.rename({id: $routeParams.id, 'name': $scope.container.newContainerName}, function (data) {
                    if (data.name) {
                        $scope.container.Name = data.name;
                        Messages.send("Container renamed", $routeParams.id);
                    } else {
                        $scope.container.newContainerName = $scope.container.Name;
                        Messages.error("Failure", "Container failed to rename.");
                    }
                });
                $scope.container.edit = false;
            };

            update();
            $scope.getChanges();
        }]);

angular.module('containerLogs', [])
    .controller('ContainerLogsController', ['$scope', '$routeParams', '$location', '$anchorScroll', 'ContainerLogs', 'Container', 'ViewSpinner',
        function ($scope, $routeParams, $location, $anchorScroll, ContainerLogs, Container, ViewSpinner) {
            $scope.stdout = '';
            $scope.stderr = '';
            $scope.showTimestamps = false;
            $scope.tailLines = 2000;

            ViewSpinner.spin();
            Container.get({id: $routeParams.id}, function (d) {
                $scope.container = d;
                ViewSpinner.stop();
            }, function (e) {
                if (e.status === 404) {
                    Messages.error("Not found", "Container not found.");
                } else {
                    Messages.error("Failure", e.data);
                }
                ViewSpinner.stop();
            });

            function getLogs() {
                ViewSpinner.spin();
                ContainerLogs.get($routeParams.id, {
                    stdout: 1,
                    stderr: 0,
                    timestamps: $scope.showTimestamps,
                    tail: $scope.tailLines
                }, function (data, status, headers, config) {
                    // Replace carriage returns with newlines to clean up output
                    data = data.replace(/[\r]/g, '\n');
                    // Strip 8 byte header from each line of output
                    data = data.substring(8);
                    data = data.replace(/\n(.{8})/g, '\n');
                    $scope.stdout = data;
                    ViewSpinner.stop();
                });

                ContainerLogs.get($routeParams.id, {
                    stdout: 0,
                    stderr: 1,
                    timestamps: $scope.showTimestamps,
                    tail: $scope.tailLines
                }, function (data, status, headers, config) {
                    // Replace carriage returns with newlines to clean up output
                    data = data.replace(/[\r]/g, '\n');
                    // Strip 8 byte header from each line of output
                    data = data.substring(8);
                    data = data.replace(/\n(.{8})/g, '\n');
                    $scope.stderr = data;
                    ViewSpinner.stop();
                });
            }

            // initial call
            getLogs();
            var logIntervalId = window.setInterval(getLogs, 5000);

            $scope.$on("$destroy", function () {
                // clearing interval when view changes
                clearInterval(logIntervalId);
            });

            $scope.scrollTo = function (id) {
                $location.hash(id);
                $anchorScroll();
            };

            $scope.toggleTimestamps = function () {
                getLogs();
            };

            $scope.toggleTail = function () {
                getLogs();
            };
        }]);

angular.module('containerTop', [])
    .controller('ContainerTopController', ['$scope', '$routeParams', 'ContainerTop', 'ViewSpinner', function ($scope, $routeParams, ContainerTop, ViewSpinner) {
        $scope.ps_args = '';

        /**
         * Get container processes
         */
        $scope.getTop = function () {
            ViewSpinner.spin();
            ContainerTop.get($routeParams.id, {
                ps_args: $scope.ps_args
            }, function (data) {
                $scope.containerTop = data;
                ViewSpinner.stop();
            });
        };

        $scope.getTop();
    }]);
angular.module('containers', [])
    .controller('ContainersController', ['$scope', 'Container', 'Settings', 'Messages', 'ViewSpinner',
        function ($scope, Container, Settings, Messages, ViewSpinner) {
            $scope.predicate = '-Created';
            $scope.toggle = false;
            $scope.displayAll = Settings.displayAll;

            var update = function (data) {
                ViewSpinner.spin();
                Container.query(data, function (d) {
                    $scope.containers = d.map(function (item) {
                        return new ContainerViewModel(item);
                    });
                    ViewSpinner.stop();
                });
            };

            var batch = function (items, action, msg) {
                ViewSpinner.spin();
                var counter = 0;
                var complete = function () {
                    counter = counter - 1;
                    if (counter === 0) {
                        ViewSpinner.stop();
                        update({all: Settings.displayAll ? 1 : 0});
                    }
                };
                angular.forEach(items, function (c) {
                    if (c.Checked) {
                        if (action === Container.start) {
                            Container.get({id: c.Id}, function (d) {
                                c = d;
                                counter = counter + 1;
                                action({id: c.Id, HostConfig: c.HostConfig || {}}, function (d) {
                                    Messages.send("Container " + msg, c.Id);
                                    var index = $scope.containers.indexOf(c);
                                    complete();
                                }, function (e) {
                                    Messages.error("Failure", e.data);
                                    complete();
                                });
                            }, function (e) {
                                if (e.status === 404) {
                                    $('.detail').hide();
                                    Messages.error("Not found", "Container not found.");
                                } else {
                                    Messages.error("Failure", e.data);
                                }
                                complete();
                            });
                        }
                        else {
                            counter = counter + 1;
                            action({id: c.Id}, function (d) {
                                Messages.send("Container " + msg, c.Id);
                                var index = $scope.containers.indexOf(c);
                                complete();
                            }, function (e) {
                                Messages.error("Failure", e.data);
                                complete();
                            });

                        }

                    }
                });
                if (counter === 0) {
                    ViewSpinner.stop();
                }
            };

            $scope.toggleSelectAll = function () {
                angular.forEach($scope.containers, function (i) {
                    i.Checked = $scope.toggle;
                });
            };

            $scope.toggleGetAll = function () {
                Settings.displayAll = $scope.displayAll;
                update({all: Settings.displayAll ? 1 : 0});
            };

            $scope.startAction = function () {
                batch($scope.containers, Container.start, "Started");
            };

            $scope.stopAction = function () {
                batch($scope.containers, Container.stop, "Stopped");
            };

            $scope.restartAction = function () {
                batch($scope.containers, Container.restart, "Restarted");
            };

            $scope.killAction = function () {
                batch($scope.containers, Container.kill, "Killed");
            };

            $scope.pauseAction = function () {
                batch($scope.containers, Container.pause, "Paused");
            };

            $scope.unpauseAction = function () {
                batch($scope.containers, Container.unpause, "Unpaused");
            };

            $scope.removeAction = function () {
                batch($scope.containers, Container.remove, "Removed");
            };

            update({all: Settings.displayAll ? 1 : 0});
        }]);

angular.module('containersNetwork', ['ngVis'])
    .controller('ContainersNetworkController', ['$scope', '$location', 'Container', 'Messages', 'VisDataSet', function ($scope, $location, Container, Messages, VisDataSet) {

        function ContainerNode(data) {
            this.Id = data.Id;
            // names have the following format: /Name
            this.Name = data.Name.substring(1);
            this.Image = data.Config.Image;
            this.Running = data.State.Running;
            var dataLinks = data.HostConfig.Links;
            if (dataLinks != null) {
                this.Links = {};
                for (var i = 0; i < dataLinks.length; i++) {
                    // links have the following format: /TargetContainerName:/SourceContainerName/LinkAlias
                    var link = dataLinks[i].split(":");
                    var target = link[0].substring(1);
                    var alias = link[1].substring(link[1].lastIndexOf("/") + 1);
                    // only keep shortest alias
                    if (this.Links[target] == null || alias.length < this.Links[target].length) {
                        this.Links[target] = alias;
                    }
                }
            }
            var dataVolumes = data.HostConfig.VolumesFrom;
            //converting array into properties for simpler and faster access
            if (dataVolumes != null) {
                this.VolumesFrom = {};
                for (var j = 0; j < dataVolumes.length; j++) {
                    this.VolumesFrom[dataVolumes[j]] = true;
                }
            }
        }

        function ContainersNetworkData() {
            this.nodes = new VisDataSet();
            this.edges = new VisDataSet();

            this.addContainerNode = function (container) {
                this.nodes.add({
                    id: container.Id,
                    label: container.Name,
                    title: "<ul style=\"list-style-type:none; padding: 0px; margin: 0px\">" +
                    "<li><strong>ID:</strong> " + container.Id + "</li>" +
                    "<li><strong>Image:</strong> " + container.Image + "</li>" +
                    "</ul>",
                    color: (container.Running ? "#8888ff" : "#cccccc")
                });
            };

            this.hasEdge = function (from, to) {
                return this.edges.getIds({
                        filter: function (item) {
                            return item.from === from.Id && item.to === to.Id;
                        }
                    }).length > 0;
            };

            this.addLinkEdgeIfExists = function (from, to) {
                if (from.Links != null && from.Links[to.Name] != null && !this.hasEdge(from, to)) {
                    this.edges.add({
                        from: from.Id,
                        to: to.Id,
                        label: from.Links[to.Name]
                    });
                }
            };

            this.addVolumeEdgeIfExists = function (from, to) {
                if (from.VolumesFrom != null && (from.VolumesFrom[to.Id] != null || from.VolumesFrom[to.Name] != null) && !this.hasEdge(from, to)) {
                    this.edges.add({
                        from: from.Id,
                        to: to.Id,
                        color: {color: '#A0A0A0', highlight: '#A0A0A0', hover: '#848484'}
                    });
                }
            };

            this.removeContainersNodes = function (containersIds) {
                this.nodes.remove(containersIds);
            };
        }

        function ContainersNetwork() {
            this.data = new ContainersNetworkData();
            this.containers = {};
            this.selectedContainersIds = [];
            this.shownContainersIds = [];
            this.events = {
                select: function (event) {
                    $scope.network.selectedContainersIds = event.nodes;
                    $scope.$apply(function () {
                        $scope.query = '';
                    });
                },
                doubleClick: function (event) {
                    $scope.$apply(function () {
                        $location.path('/containers/' + event.nodes[0]);
                    });
                }
            };
            this.options = {
                navigation: true,
                keyboard: true,
                height: '500px', width: '700px',
                nodes: {
                    shape: 'box'
                },
                edges: {
                    style: 'arrow'
                },
                physics: {
                    barnesHut: {
                        springLength: 200
                    }
                }
            };

            this.addContainer = function (data) {
                var container = new ContainerNode(data);
                this.containers[container.Id] = container;
                this.shownContainersIds.push(container.Id);
                this.data.addContainerNode(container);
                for (var otherContainerId in this.containers) {
                    var otherContainer = this.containers[otherContainerId];
                    this.data.addLinkEdgeIfExists(container, otherContainer);
                    this.data.addLinkEdgeIfExists(otherContainer, container);
                    this.data.addVolumeEdgeIfExists(container, otherContainer);
                    this.data.addVolumeEdgeIfExists(otherContainer, container);
                }
            };

            this.selectContainers = function (query) {
                if (this.component != null) {
                    this.selectedContainersIds = this.searchContainers(query);
                    this.component.selectNodes(this.selectedContainersIds);
                }
            };

            this.searchContainers = function (query) {
                if (query.trim() === "") {
                    return [];
                }
                var selectedContainersIds = [];
                for (var i = 0; i < this.shownContainersIds.length; i++) {
                    var container = this.containers[this.shownContainersIds[i]];
                    if (container.Name.indexOf(query) > -1 ||
                        container.Image.indexOf(query) > -1 ||
                        container.Id.indexOf(query) > -1) {
                        selectedContainersIds.push(container.Id);
                    }
                }
                return selectedContainersIds;
            };

            this.hideSelected = function () {
                var i = 0;
                while (i < this.shownContainersIds.length) {
                    if (this.selectedContainersIds.indexOf(this.shownContainersIds[i]) > -1) {
                        this.shownContainersIds.splice(i, 1);
                    } else {
                        i++;
                    }
                }
                this.data.removeContainersNodes(this.selectedContainersIds);
                $scope.query = '';
                this.selectedContainersIds = [];
            };

            this.searchDownstream = function (containerId, downstreamContainersIds) {
                if (downstreamContainersIds.indexOf(containerId) > -1) {
                    return;
                }
                downstreamContainersIds.push(containerId);
                var container = this.containers[containerId];
                if (container.Links == null && container.VolumesFrom == null) {
                    return;
                }
                for (var otherContainerId in this.containers) {
                    var otherContainer = this.containers[otherContainerId];
                    if (container.Links != null && container.Links[otherContainer.Name] != null) {
                        this.searchDownstream(otherContainer.Id, downstreamContainersIds);
                    } else if (container.VolumesFrom != null &&
                        container.VolumesFrom[otherContainer.Id] != null) {
                        this.searchDownstream(otherContainer.Id, downstreamContainersIds);
                    }
                }
            };

            this.updateShownContainers = function (newShownContainersIds) {
                for (var containerId in this.containers) {
                    if (newShownContainersIds.indexOf(containerId) > -1 &&
                        this.shownContainersIds.indexOf(containerId) === -1) {
                        this.data.addContainerNode(this.containers[containerId]);
                    } else if (newShownContainersIds.indexOf(containerId) === -1 &&
                        this.shownContainersIds.indexOf(containerId) > -1) {
                        this.data.removeContainersNodes(containerId);
                    }
                }
                this.shownContainersIds = newShownContainersIds;
            };

            this.showSelectedDownstream = function () {
                var downstreamContainersIds = [];
                for (var i = 0; i < this.selectedContainersIds.length; i++) {
                    this.searchDownstream(this.selectedContainersIds[i], downstreamContainersIds);
                }
                this.updateShownContainers(downstreamContainersIds);
            };

            this.searchUpstream = function (containerId, upstreamContainersIds) {
                if (upstreamContainersIds.indexOf(containerId) > -1) {
                    return;
                }
                upstreamContainersIds.push(containerId);
                var container = this.containers[containerId];
                for (var otherContainerId in this.containers) {
                    var otherContainer = this.containers[otherContainerId];
                    if (otherContainer.Links != null && otherContainer.Links[container.Name] != null) {
                        this.searchUpstream(otherContainer.Id, upstreamContainersIds);
                    } else if (otherContainer.VolumesFrom != null &&
                        otherContainer.VolumesFrom[container.Id] != null) {
                        this.searchUpstream(otherContainer.Id, upstreamContainersIds);
                    }
                }
            };

            this.showSelectedUpstream = function () {
                var upstreamContainersIds = [];
                for (var i = 0; i < this.selectedContainersIds.length; i++) {
                    this.searchUpstream(this.selectedContainersIds[i], upstreamContainersIds);
                }
                this.updateShownContainers(upstreamContainersIds);
            };

            this.showAll = function () {
                for (var containerId in this.containers) {
                    if (this.shownContainersIds.indexOf(containerId) === -1) {
                        this.data.addContainerNode(this.containers[containerId]);
                        this.shownContainersIds.push(containerId);
                    }
                }
            };

        }

        $scope.network = new ContainersNetwork();

        var showFailure = function (event) {
            Messages.error('Failure', e.data);
        };

        var addContainer = function (container) {
            $scope.network.addContainer(container);
        };

        var update = function (data) {
            Container.query(data, function (d) {
                for (var i = 0; i < d.length; i++) {
                    Container.get({id: d[i].Id}, addContainer, showFailure);
                }
            });
        };
        update({all: 0});

        $scope.includeStopped = false;
        $scope.toggleIncludeStopped = function () {
            $scope.network.updateShownContainers([]);
            update({all: $scope.includeStopped ? 1 : 0});
        };

    }]);

angular.module('dashboard', [])
    .controller('DashboardController', ['$scope', 'Container', 'Image', 'Settings', 'LineChart', function ($scope, Container, Image, Settings, LineChart) {
        $scope.predicate = '-Created';
        $scope.containers = [];

        var getStarted = function (data) {
            $scope.totalContainers = data.length;
            LineChart.build('#containers-started-chart', data, function (c) {
                return new Date(c.Created * 1000).toLocaleDateString();
            });
            var s = $scope;
            Image.query({}, function (d) {
                s.totalImages = d.length;
                LineChart.build('#images-created-chart', d, function (c) {
                    return new Date(c.Created * 1000).toLocaleDateString();
                });
            });
        };

        var opts = {animation: false};
        if (Settings.firstLoad) {
            opts.animation = true;
            Settings.firstLoad = false;
            $('#masthead').show();

            setTimeout(function () {
                $('#masthead').slideUp('slow');
            }, 5000);
        }

        Container.query({all: 1}, function (d) {
            var running = 0;
            var ghost = 0;
            var stopped = 0;

            for (var i = 0; i < d.length; i++) {
                var item = d[i];

                if (item.Status === "Ghost") {
                    ghost += 1;
                } else if (item.Status.indexOf('Exit') !== -1) {
                    stopped += 1;
                } else {
                    running += 1;
                    $scope.containers.push(new ContainerViewModel(item));
                }
            }

            getStarted(d);

            var c = new Chart($('#containers-chart').get(0).getContext("2d"));
            var data = [
                {
                    value: running,
                    color: '#5bb75b',
                    title: 'Running'
                }, // running
                {
                    value: stopped,
                    color: '#C7604C',
                    title: 'Stopped'
                }/*, // stopped
                {
                    value: ghost,
                    color: '#E2EAE9',
                    title: 'Ghost'
                } // ghost*/
            ];

            c.Doughnut(data, opts);
            var lgd = $('#chart-legend').get(0);
            legend(lgd, data);
        });
    }]);

angular.module('events', ['ngOboe'])
    .controller('EventsController', ['Settings', '$scope', 'Oboe', 'Messages', '$timeout', function (Settings, $scope, oboe, Messages, $timeout) {
        $scope.updateEvents = function () {
            $scope.dockerEvents = [];

            // TODO: Clean up URL building
            var url = Settings.url + '/events?';

            if ($scope.model.since) {
                var sinceSecs = Math.floor($scope.model.since.getTime() / 1000);
                url += 'since=' + sinceSecs + '&';
            }
            if ($scope.model.until) {
                var untilSecs = Math.floor($scope.model.until.getTime() / 1000);
                url += 'until=' + untilSecs;
            }

            oboe({
                url: url,
                pattern: '{id status time}'
            })
                .then(function (node) {
                    // finished loading
                    $timeout(function () {
                        $scope.$apply();
                    });
                }, function (error) {
                    // handle errors
                    Messages.error("Failure", error.data);
                }, function (node) {
                    // node received
                    $scope.dockerEvents.push(node);
                });
        };

        // Init
        $scope.model = {};
        $scope.model.since = new Date(Date.now() - 86400000); // 24 hours in the past
        $scope.model.until = new Date();
        $scope.updateEvents();

    }]);
angular.module('footer', [])
    .controller('FooterController', ['$scope', 'Settings', 'Docker', function ($scope, Settings, Docker) {
        $scope.template = 'app/components/footer/statusbar.html';

        $scope.uiVersion = Settings.uiVersion;
        Docker.get({}, function (d) {
            $scope.apiVersion = d.ApiVersion;
        });
    }]);

angular.module('image', [])
    .controller('ImageController', ['$scope', '$q', '$routeParams', '$location', 'Image', 'Container', 'Messages', 'LineChart',
        function ($scope, $q, $routeParams, $location, Image, Container, Messages, LineChart) {
            $scope.history = [];
            $scope.tag = {repo: '', force: false};

            $scope.remove = function () {
                Image.remove({id: $routeParams.id}, function (d) {
                    Messages.send("Image Removed", $routeParams.id);
                }, function (e) {
                    $scope.error = e.data;
                    $('#error-message').show();
                });
            };

            $scope.getHistory = function () {
                Image.history({id: $routeParams.id}, function (d) {
                    $scope.history = d;
                });
            };

            $scope.updateTag = function () {
                var tag = $scope.tag;
                Image.tag({id: $routeParams.id, repo: tag.repo, force: tag.force ? 1 : 0}, function (d) {
                    Messages.send("Tag Added", $routeParams.id);
                }, function (e) {
                    $scope.error = e.data;
                    $('#error-message').show();
                });
            };

            function getContainersFromImage($q, Container, tag) {
                var defer = $q.defer();

                Container.query({all: 1, notruc: 1}, function (d) {
                    var containers = [];
                    for (var i = 0; i < d.length; i++) {
                        var c = d[i];
                        if (c.Image === tag) {
                            containers.push(new ContainerViewModel(c));
                        }
                    }
                    defer.resolve(containers);
                });

                return defer.promise;
            }

            Image.get({id: $routeParams.id}, function (d) {
                $scope.image = d;
                $scope.tag = d.id;
                var t = $routeParams.tag;
                if (t && t !== ":") {
                    $scope.tag = t;
                    var promise = getContainersFromImage($q, Container, t);

                    promise.then(function (containers) {
                        LineChart.build('#containers-started-chart', containers, function (c) {
                            return new Date(c.Created * 1000).toLocaleDateString();
                        });
                    });
                }
            }, function (e) {
                if (e.status === 404) {
                    $('.detail').hide();
                    $scope.error = "Image not found.<br />" + $routeParams.id;
                } else {
                    $scope.error = e.data;
                }
                $('#error-message').show();
            });

            $scope.getHistory();
        }]);

angular.module('images', [])
    .controller('ImagesController', ['$scope', 'Image', 'ViewSpinner', 'Messages',
        function ($scope, Image, ViewSpinner, Messages) {
            $scope.toggle = false;
            $scope.predicate = '-Created';

            $scope.showBuilder = function () {
                $('#build-modal').modal('show');
            };

            $scope.removeAction = function () {
                ViewSpinner.spin();
                var counter = 0;
                var complete = function () {
                    counter = counter - 1;
                    if (counter === 0) {
                        ViewSpinner.stop();
                    }
                };
                angular.forEach($scope.images, function (i) {
                    if (i.Checked) {
                        counter = counter + 1;
                        Image.remove({id: i.Id}, function (d) {
                            angular.forEach(d, function (resource) {
                                Messages.send("Image deleted", resource.Deleted);
                            });
                            var index = $scope.images.indexOf(i);
                            $scope.images.splice(index, 1);
                            complete();
                        }, function (e) {
                            Messages.error("Failure", e.data);
                            complete();
                        });
                    }
                });
            };

            $scope.toggleSelectAll = function () {
                angular.forEach($scope.images, function (i) {
                    i.Checked = $scope.toggle;
                });
            };

            ViewSpinner.spin();
            Image.query({}, function (d) {
                $scope.images = d.map(function (item) {
                    return new ImageViewModel(item);
                });
                ViewSpinner.stop();
            }, function (e) {
                Messages.error("Failure", e.data);
                ViewSpinner.stop();
            });
        }]);

angular.module('info', [])
    .controller('InfoController', ['$scope', 'System', 'Docker', 'Settings', 'Messages',
        function ($scope, System, Docker, Settings, Messages) {
            $scope.info = {};
            $scope.docker = {};
            $scope.endpoint = Settings.endpoint;
            $scope.apiVersion = Settings.version;

            Docker.get({}, function (d) {
                $scope.docker = d;
            });
            System.get({}, function (d) {
                $scope.info = d;
            });
        }]);

angular.module('jenkins',[])
    .controller('JenkinsController',['$scope',function($scope){
        $scope.firstName = "John";
        $scope.lastName = "Doe";
    }]);
angular.module('masthead', [])
    .controller('MastheadController', ['$scope', function ($scope) {
        $scope.template = 'app/components/masthead/masthead.html';
    }]);

angular.module('pullImage', [])
    .controller('PullImageController', ['$scope', '$log', 'Dockerfile', 'Messages', 'Image', 'ViewSpinner',
        function ($scope, $log, Dockerfile, Messages, Image, ViewSpinner) {
            $scope.template = 'app/components/pullImage/pullImage.html';

            $scope.init = function () {
                $scope.config = {
                    registry: '',
                    repo: '',
                    fromImage: '',
                    tag: 'latest'
                };
            };

            $scope.init();

            function failedRequestHandler(e, Messages) {
                Messages.error('Error', errorMsgFilter(e));
            }

            $scope.pull = function () {
                $('#error-message').hide();
                var config = angular.copy($scope.config);
                var imageName = (config.registry ? config.registry + '/' : '' ) +
                    (config.repo ? config.repo + '/' : '') +
                    (config.fromImage) +
                    (config.tag ? ':' + config.tag : '');

                ViewSpinner.spin();
                $('#pull-modal').modal('hide');
                Image.create(config, function (data) {
                    ViewSpinner.stop();
                    if (data.constructor === Array) {
                        var f = data.length > 0 && data[data.length - 1].hasOwnProperty('error');
                        //check for error
                        if (f) {
                            var d = data[data.length - 1];
                            $scope.error = "Cannot pull image " + imageName + " Reason: " + d.error;
                            $('#pull-modal').modal('show');
                            $('#error-message').show();
                        } else {
                            Messages.send("Image Added", imageName);
                            $scope.init();
                        }
                    } else {
                        Messages.send("Image Added", imageName);
                        $scope.init();
                    }
                }, function (e) {
                    ViewSpinner.stop();
                    $scope.error = "Cannot pull image " + imageName + " Reason: " + e.data;
                    $('#pull-modal').modal('show');
                    $('#error-message').show();
                });
            };
        }]);

angular.module('sidebar', [])
    .controller('SideBarController', ['$scope', 'Container', 'Settings',
        function ($scope, Container, Settings) {
            $scope.template = 'partials/sidebar.html';
            $scope.containers = [];
            $scope.endpoint = Settings.endpoint;

            Container.query({all: 0}, function (d) {
                $scope.containers = d;
            });
        }]);

angular.module('startContainer', ['ui.bootstrap'])
    .controller('StartContainerController', ['$scope', '$routeParams', '$location', 'Container', 'Messages', 'containernameFilter', 'errorMsgFilter',
        function ($scope, $routeParams, $location, Container, Messages, containernameFilter, errorMsgFilter) {
            $scope.template = 'app/components/startContainer/startcontainer.html';

            Container.query({all: 1}, function (d) {
                $scope.containerNames = d.map(function (container) {
                    return containernameFilter(container);
                });
            });

            $scope.config = {
                Env: [],
                Volumes: [],
                SecurityOpts: [],
                HostConfig: {
                    PortBindings: [],
                    Binds: [],
                    Links: [],
                    Dns: [],
                    DnsSearch: [],
                    VolumesFrom: [],
                    CapAdd: [],
                    CapDrop: [],
                    Devices: [],
                    LxcConf: [],
                    ExtraHosts: []
                }
            };

            $scope.menuStatus = {
                containerOpen: true,
                hostConfigOpen: false
            };

            function failedRequestHandler(e, Messages) {
                Messages.error('Error', errorMsgFilter(e));
            }

            function rmEmptyKeys(col) {
                for (var key in col) {
                    if (col[key] === null || col[key] === undefined || col[key] === '' || $.isEmptyObject(col[key]) || col[key].length === 0) {
                        delete col[key];
                    }
                }
            }

            function getNames(arr) {
                return arr.map(function (item) {
                    return item.name;
                });
            }

            $scope.create = function () {
                // Copy the config before transforming fields to the remote API format
                var config = angular.copy($scope.config);

                config.Image = $routeParams.id;

                if (config.Cmd && config.Cmd[0] === "[") {
                    config.Cmd = angular.fromJson(config.Cmd);
                } else if (config.Cmd) {
                    config.Cmd = config.Cmd.split(' ');
                }

                config.Env = config.Env.map(function (envar) {
                    return envar.name + '=' + envar.value;
                });

                config.Volumes = getNames(config.Volumes);
                config.SecurityOpts = getNames(config.SecurityOpts);

                config.HostConfig.VolumesFrom = getNames(config.HostConfig.VolumesFrom);
                config.HostConfig.Binds = getNames(config.HostConfig.Binds);
                config.HostConfig.Links = getNames(config.HostConfig.Links);
                config.HostConfig.Dns = getNames(config.HostConfig.Dns);
                config.HostConfig.DnsSearch = getNames(config.HostConfig.DnsSearch);
                config.HostConfig.CapAdd = getNames(config.HostConfig.CapAdd);
                config.HostConfig.CapDrop = getNames(config.HostConfig.CapDrop);
                config.HostConfig.LxcConf = config.HostConfig.LxcConf.reduce(function (prev, cur, idx) {
                    prev[cur.name] = cur.value;
                    return prev;
                }, {});
                config.HostConfig.ExtraHosts = config.HostConfig.ExtraHosts.map(function (entry) {
                    return entry.host + ':' + entry.ip;
                });

                var ExposedPorts = {};
                var PortBindings = {};
                config.HostConfig.PortBindings.forEach(function (portBinding) {
                    var intPort = portBinding.intPort + "/tcp";
                    if (portBinding.protocol === "udp") {
                        intPort = portBinding.intPort + "/udp";
                    }
                    var binding = {
                        HostIp: portBinding.ip,
                        HostPort: portBinding.extPort
                    };
                    if (portBinding.intPort) {
                        ExposedPorts[intPort] = {};
                        if (intPort in PortBindings) {
                            PortBindings[intPort].push(binding);
                        } else {
                            PortBindings[intPort] = [binding];
                        }
                    } else {
                        Messages.send('Warning', 'Internal port must be specified for PortBindings');
                    }
                });
                config.ExposedPorts = ExposedPorts;
                config.HostConfig.PortBindings = PortBindings;

                // Remove empty fields from the request to avoid overriding defaults
                rmEmptyKeys(config.HostConfig);
                rmEmptyKeys(config);

                var ctor = Container;
                var loc = $location;
                var s = $scope;
                Container.create(config, function (d) {
                    if (d.Id) {
                        var reqBody = config.HostConfig || {};
                        reqBody.id = d.Id;
                        ctor.start(reqBody, function (cd) {
                            if (cd.id) {
                                Messages.send('Container Started', d.Id);
                                $('#create-modal').modal('hide');
                                loc.path('/containers/' + d.Id + '/');
                            } else {
                                failedRequestHandler(cd, Messages);
                                ctor.remove({id: d.Id}, function () {
                                    Messages.send('Container Removed', d.Id);
                                });
                            }
                        }, function (e) {
                            failedRequestHandler(e, Messages);
                        });
                    } else {
                        failedRequestHandler(d, Messages);
                    }
                }, function (e) {
                    failedRequestHandler(e, Messages);
                });
            };

            $scope.addEntry = function (array, entry) {
                array.push(entry);
            };
            $scope.rmEntry = function (array, entry) {
                var idx = array.indexOf(entry);
                array.splice(idx, 1);
            };
        }]);

angular.module('stats', [])
    .controller('StatsController', ['Settings', '$scope', 'Messages', '$timeout', 'Container', '$routeParams', 'humansizeFilter', '$sce', function (Settings, $scope, Messages, $timeout, Container, $routeParams, humansizeFilter, $sce) {
        // TODO: Implement memory chart, force scale to 0-100 for cpu, 0 to limit for memory, fix charts on dashboard,
        // TODO: Force memory scale to 0 - max memory
        //var initialStats = {}; // Used to set scale of memory graph.
        //
        //Container.stats({id: $routeParams.id}, function (d) {
        //    var arr = Object.keys(d).map(function (key) {
        //        return d[key];
        //    });
        //    if (arr.join('').indexOf('no such id') !== -1) {
        //        Messages.error('Unable to retrieve stats', 'Is this container running?');
        //        return;
        //    }
        //    initialStats = d;
        //}, function () {
        //    Messages.error('Unable to retrieve stats', 'Is this container running?');
        //});

        var cpuLabels = [];
        var cpuData = [];
        var memoryLabels = [];
        var memoryData = [];
        var networkLabels = [];
        var networkTxData = [];
        var networkRxData = [];
        for (var i = 0; i < 20; i++) {
            cpuLabels.push('');
            cpuData.push(0);
            memoryLabels.push('');
            memoryData.push(0);
            networkLabels.push('');
            networkTxData.push(0);
            networkRxData.push(0);
        }
        var cpuDataset = { // CPU Usage
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: cpuData
        };
        var memoryDataset = {
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: memoryData
        };
        var networkRxDataset = {
            label: "Rx Bytes",
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: networkRxData
        };
        var networkTxDataset = {
            label: "Tx Bytes",
            fillColor: "rgba(255,180,174,0.5)",
            strokeColor: "rgba(255,180,174,1)",
            pointColor: "rgba(255,180,174,1)",
            pointStrokeColor: "#fff",
            data: networkTxData
        };
        var networkLegendData = [
            {
                //value: '',
                color: 'rgba(151,187,205,0.5)',
                title: 'Rx Data'
            },
            {
                //value: '',
                color: 'rgba(255,180,174,0.5)',
                title: 'Rx Data'
            }];
        legend($('#network-legend').get(0), networkLegendData);

        Chart.defaults.global.animationSteps = 30; // Lower from 60 to ease CPU load.
        var cpuChart = new Chart($('#cpu-stats-chart').get(0).getContext("2d")).Line({
            labels: cpuLabels,
            datasets: [cpuDataset]
        }, {
            responsive: true
        });

        var memoryChart = new Chart($('#memory-stats-chart').get(0).getContext('2d')).Line({
                labels: memoryLabels,
                datasets: [memoryDataset]
            },
            {
                scaleLabel: function (valueObj) {
                    return humansizeFilter(parseInt(valueObj.value, 10));
                },
                responsive: true
                //scaleOverride: true,
                //scaleSteps: 10,
                //scaleStepWidth: Math.ceil(initialStats.memory_stats.limit / 10),
                //scaleStartValue: 0
            });
        var networkChart = new Chart($('#network-stats-chart').get(0).getContext("2d")).Line({
            labels: networkLabels,
            datasets: [networkRxDataset, networkTxDataset]
        }, {
            scaleLabel: function (valueObj) {
                return humansizeFilter(parseInt(valueObj.value, 10));
            },
            responsive: true
        });
        $scope.networkLegend = $sce.trustAsHtml(networkChart.generateLegend());

        function updateStats() {
            Container.stats({id: $routeParams.id}, function (d) {
                var arr = Object.keys(d).map(function (key) {
                    return d[key];
                });
                if (arr.join('').indexOf('no such id') !== -1) {
                    Messages.error('Unable to retrieve stats', 'Is this container running?');
                    return;
                }

                // Update graph with latest data
                $scope.data = d;
                updateCpuChart(d);
                updateMemoryChart(d);
                updateNetworkChart(d);
                timeout = $timeout(updateStats, 2000);
            }, function () {
                Messages.error('Unable to retrieve stats', 'Is this container running?');
            });
        }

        var timeout;
        $scope.$on('$destroy', function () {
            $timeout.cancel(timeout);
        });

        updateStats();

        function updateCpuChart(data) {
            console.log('updateCpuChart', data);
            cpuChart.addData([calculateCPUPercent(data)], new Date(data.read).toLocaleTimeString());
            cpuChart.removeData();
        }

        function updateMemoryChart(data) {
            console.log('updateMemoryChart', data);
            memoryChart.addData([data.memory_stats.usage], new Date(data.read).toLocaleTimeString());
            memoryChart.removeData();
        }

        var lastRxBytes = 0, lastTxBytes = 0;

        function updateNetworkChart(data) {
            var rxBytes = 0, txBytes = 0;
            if (lastRxBytes !== 0 || lastTxBytes !== 0) {
                // These will be zero on first call, ignore to prevent large graph spike
                rxBytes = data.network.rx_bytes - lastRxBytes;
                txBytes = data.network.tx_bytes - lastTxBytes;
            }
            lastRxBytes = data.network.rx_bytes;
            lastTxBytes = data.network.tx_bytes;
            console.log('updateNetworkChart', data);
            networkChart.addData([rxBytes, txBytes], new Date(data.read).toLocaleTimeString());
            networkChart.removeData();
        }

        function calculateCPUPercent(stats) {
            // Same algorithm the official client uses: https://github.com/docker/docker/blob/master/api/client/stats.go#L195-L208
            var prevCpu = stats.precpu_stats;
            var curCpu = stats.cpu_stats;

            var cpuPercent = 0.0;

            // calculate the change for the cpu usage of the container in between readings
            var cpuDelta = curCpu.cpu_usage.total_usage - prevCpu.cpu_usage.total_usage;
            // calculate the change for the entire system between readings
            var systemDelta = curCpu.system_cpu_usage - prevCpu.system_cpu_usage;

            if (systemDelta > 0.0 && cpuDelta > 0.0) {
                //console.log('size thing:', curCpu.cpu_usage.percpu_usage);
                cpuPercent = (cpuDelta / systemDelta) * curCpu.cpu_usage.percpu_usage.length * 100.0;
            }
            return cpuPercent;
        }
    }])
;
angular.module('dockerui.filters', [])
    .filter('truncate', function () {
        'use strict';
        return function (text, length, end) {
            if (isNaN(length)) {
                length = 10;
            }

            if (end === undefined) {
                end = '...';
            }

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length - end.length) + end;
            }
        };
    })
    .filter('statusbadge', function () {
        'use strict';
        return function (text) {
            if (text === 'Ghost') {
                return 'important';
            } else if (text.indexOf('Exit') !== -1 && text !== 'Exit 0') {
                return 'warning';
            }
            return 'success';
        };
    })
    .filter('getstatetext', function () {
        'use strict';
        return function (state) {
            if (state === undefined) {
                return '';
            }
            if (state.Ghost && state.Running) {
                return 'Ghost';
            }
            if (state.Running && state.Paused) {
                return 'Running (Paused)';
            }
            if (state.Running) {
                return 'Running';
            }
            return 'Stopped';
        };
    })
    .filter('getstatelabel', function () {
        'use strict';
        return function (state) {
            if (state === undefined) {
                return '';
            }

            if (state.Ghost && state.Running) {
                return 'label-important';
            }
            if (state.Running) {
                return 'label-success';
            }
            return '';
        };
    })
    .filter('humansize', function () {
        'use strict';
        return function (bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) {
                return 'n/a';
            }
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
            var value = bytes / Math.pow(1024, i);
            var decimalPlaces = (i < 1) ? 0 : (i - 1);
            return value.toFixed(decimalPlaces) + ' ' + sizes[[i]];
        };
    })
    .filter('containername', function () {
        'use strict';
        return function (container) {
            var name = container.Names[0];
            return name.substring(1, name.length);
        };
    })
    .filter('repotag', function () {
        'use strict';
        return function (image) {
            if (image.RepoTags && image.RepoTags.length > 0) {
                var tag = image.RepoTags[0];
                if (tag === '<none>:<none>') {
                    tag = '';
                }
                return tag;
            }
            return '';
        };
    })
    .filter('getdate', function () {
        'use strict';
        return function (data) {
            //Multiply by 1000 for the unix format
            var date = new Date(data * 1000);
            return date.toDateString();
        };
    })
    .filter('errorMsg', function () {
        return function (object) {
            var idx = 0;
            var msg = '';
            while (object[idx] && typeof(object[idx]) === 'string') {
                msg += object[idx];
                idx++;
            }
            return msg;
        };
    });

angular.module('dockerui.services', ['ngResource'])
    .factory('Container', ['$resource', 'Settings', function ContainerFactory($resource, Settings) {
        'use strict';
        // Resource for interacting with the docker containers
        // http://docs.docker.com/reference/api/docker_remote_api_v1.20/#2-1-containers
        return $resource(Settings.url + '/containers/:id/:action', {
            name: '@name'
        }, {
            query: {method: 'GET', params: {all: 0, action: 'json'}, isArray: true},
            get: {method: 'GET', params: {action: 'json'}},
            start: {method: 'POST', params: {id: '@id', action: 'start'}},
            stop: {method: 'POST', params: {id: '@id', t: 5, action: 'stop'}},
            restart: {method: 'POST', params: {id: '@id', t: 5, action: 'restart'}},
            kill: {method: 'POST', params: {id: '@id', action: 'kill'}},
            pause: {method: 'POST', params: {id: '@id', action: 'pause'}},
            unpause: {method: 'POST', params: {id: '@id', action: 'unpause'}},
            changes: {method: 'GET', params: {action: 'changes'}, isArray: true},
            create: {method: 'POST', params: {action: 'create'}},
            remove: {method: 'DELETE', params: {id: '@id', v: 0}},
            rename: {method: 'POST', params: {id: '@id', action: 'rename'}, isArray: false},
            stats: {method: 'GET', params: {id: '@id', stream: false, action: 'stats'}, timeout: 2000}
        });
    }])
    .factory('ContainerCommit', ['$resource', '$http', 'Settings', function ContainerCommitFactory($resource, $http, Settings) {
        'use strict';
        // http://docs.docker.com/reference/api/docker_remote_api_v1.20/#create-a-new-image-from-a-container-s-changes
        return {
            commit: function (params, callback) {
                $http({
                    method: 'POST',
                    url: Settings.url + '/commit',
                    params: {
                        'container': params.id,
                        'repo': params.repo
                    }
                }).success(callback).error(function (data, status, headers, config) {
                    console.log(error, data);
                });
            }
        };
    }])
    .factory('ContainerLogs', ['$resource', '$http', 'Settings', function ContainerLogsFactory($resource, $http, Settings) {
        'use strict';
        // http://docs.docker.com/reference/api/docker_remote_api_v1.20/#get-container-logs
        return {
            get: function (id, params, callback) {
                $http({
                    method: 'GET',
                    url: Settings.url + '/containers/' + id + '/logs',
                    params: {
                        'stdout': params.stdout || 0,
                        'stderr': params.stderr || 0,
                        'timestamps': params.timestamps || 0,
                        'tail': params.tail || 'all'
                    }
                }).success(callback).error(function (data, status, headers, config) {
                    console.log(error, data);
                });
            }
        };
    }])
    .factory('ContainerTop', ['$http', 'Settings', function ($http, Settings) {
        'use strict';
        // http://docs.docker.com/reference/api/docker_remote_api_v1.20/#list-processes-running-inside-a-container
        return {
            get: function (id, params, callback, errorCallback) {
                $http({
                    method: 'GET',
                    url: Settings.url + '/containers/' + id + '/top',
                    params: {
                        ps_args: params.ps_args
                    }
                }).success(callback);
            }
        };
    }])
    .factory('Image', ['$resource', 'Settings', function ImageFactory($resource, Settings) {
        'use strict';
        // http://docs.docker.com/reference/api/docker_remote_api_v1.20/#2-2-images
        return $resource(Settings.url + '/images/:id/:action', {}, {
            query: {method: 'GET', params: {all: 0, action: 'json'}, isArray: true},
            get: {method: 'GET', params: {action: 'json'}},
            search: {method: 'GET', params: {action: 'search'}},
            history: {method: 'GET', params: {action: 'history'}, isArray: true},
            create: {
                method: 'POST', isArray: true, transformResponse: [function f(data) {
                    var str = data.replace(/\n/g, " ").replace(/\}\W*\{/g, "}, {");
                    return angular.fromJson("[" + str + "]");
                }],
                params: {action: 'create', fromImage: '@fromImage', repo: '@repo', tag: '@tag', registry: '@registry'}
            },
            insert: {method: 'POST', params: {id: '@id', action: 'insert'}},
            push: {method: 'POST', params: {id: '@id', action: 'push'}},
            tag: {method: 'POST', params: {id: '@id', action: 'tag', force: 0, repo: '@repo'}},
            remove: {method: 'DELETE', params: {id: '@id'}, isArray: true}
        });
    }])
    .factory('Docker', ['$resource', 'Settings', function DockerFactory($resource, Settings) {
        'use strict';
        // http://docs.docker.com/reference/api/docker_remote_api_v1.20/#show-the-docker-version-information
        return $resource(Settings.url + '/version', {}, {
            get: {method: 'GET'}
        });
    }])
    .factory('Auth', ['$resource', 'Settings', function AuthFactory($resource, Settings) {
        'use strict';
        // http://docs.docker.com/reference/api/docker_remote_api_v1.20/#check-auth-configuration
        return $resource(Settings.url + '/auth', {}, {
            get: {method: 'GET'},
            update: {method: 'POST'}
        });
    }])
    .factory('System', ['$resource', 'Settings', function SystemFactory($resource, Settings) {
        'use strict';
        // http://docs.docker.com/reference/api/docker_remote_api_v1.20/#display-system-wide-information
        return $resource(Settings.url + '/info', {}, {
            get: {method: 'GET'}
        });
    }])
    .factory('Settings', ['DOCKER_ENDPOINT', 'DOCKER_PORT', 'DOCKER_API_VERSION', 'UI_VERSION', function SettingsFactory(DOCKER_ENDPOINT, DOCKER_PORT, DOCKER_API_VERSION, UI_VERSION) {
        'use strict';
        var url = DOCKER_ENDPOINT;
        if (DOCKER_PORT) {
            url = url + DOCKER_PORT + '\\' + DOCKER_PORT;
        }
        return {
            displayAll: false,
            endpoint: DOCKER_ENDPOINT,
            version: DOCKER_API_VERSION,
            rawUrl: DOCKER_ENDPOINT + DOCKER_PORT + '/' + DOCKER_API_VERSION,
            uiVersion: UI_VERSION,
            url: url,
            firstLoad: true
        };
    }])
    .factory('ViewSpinner', function ViewSpinnerFactory() {
        'use strict';
        var spinner = new Spinner();
        var target = document.getElementById('view');

        return {
            spin: function () {
                spinner.spin(target);
            },
            stop: function () {
                spinner.stop();
            }
        };
    })
    .factory('Messages', ['$rootScope', function MessagesFactory($rootScope) {
        'use strict';
        return {
            send: function (title, text) {
                $.gritter.add({
                    title: title,
                    text: text,
                    time: 2000,
                    before_open: function () {
                        if ($('.gritter-item-wrapper').length === 3) {
                            return false;
                        }
                    }
                });
            },
            error: function (title, text) {
                $.gritter.add({
                    title: title,
                    text: text,
                    time: 10000,
                    before_open: function () {
                        if ($('.gritter-item-wrapper').length === 4) {
                            return false;
                        }
                    }
                });
            }
        };
    }])
    .factory('Dockerfile', ['Settings', function DockerfileFactory(Settings) {
        'use strict';
        // http://docs.docker.com/reference/api/docker_remote_api_v1.20/#build-image-from-a-dockerfile
        var url = Settings.rawUrl + '/build';
        return {
            build: function (file, callback) {
                var data = new FormData();
                var dockerfile = new Blob([file], {type: 'text/text'});
                data.append('Dockerfile', dockerfile);

                var request = new XMLHttpRequest();
                request.onload = callback;
                request.open('POST', url);
                request.send(data);
            }
        };
    }])
    .factory('LineChart', ['Settings', function LineChartFactory(Settings) {
        'use strict';
        return {
            build: function (id, data, getkey) {
                var chart = new Chart($(id).get(0).getContext("2d"));
                var map = {};

                for (var i = 0; i < data.length; i++) {
                    var c = data[i];
                    var key = getkey(c);

                    var count = map[key];
                    if (count === undefined) {
                        count = 0;
                    }
                    count += 1;
                    map[key] = count;
                }

                var labels = [];
                data = [];
                var keys = Object.keys(map);
                var max = 1;

                for (i = keys.length - 1; i > -1; i--) {
                    var k = keys[i];
                    labels.push(k);
                    data.push(map[k]);
                    if (map[k] > max) {
                      max = map[k];
                    }
                }
                var dataset = {
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    data: data
                };
                chart.Line({
                        labels: labels,
                        datasets: [dataset]
                    },
                    {
                        scaleStepWidth: 1,
                        pointDotRadius: 1,
                        scaleOverride: true,
                        scaleSteps: max
                    });
            }
        };
    }]);

function ImageViewModel(data) {
    this.Id = data.Id;
    this.Tag = data.Tag;
    this.Repository = data.Repository;
    this.Created = data.Created;
    this.Checked = false;
    this.RepoTags = data.RepoTags;
    this.VirtualSize = data.VirtualSize;
}

function ContainerViewModel(data) {
    this.Id = data.Id;
    this.Image = data.Image;
    this.Command = data.Command;
    this.Created = data.Created;
    this.SizeRw = data.SizeRw;
    this.Status = data.Status;
    this.Checked = false;
    this.Names = data.Names;
}

angular.module('dockerui.templates', ['app/components/builder/builder.html', 'app/components/container/container.html', 'app/components/containerLogs/containerlogs.html', 'app/components/containerTop/containerTop.html', 'app/components/containers/containers.html', 'app/components/containersNetwork/containersNetwork.html', 'app/components/dashboard/dashboard.html', 'app/components/events/events.html', 'app/components/footer/statusbar.html', 'app/components/image/image.html', 'app/components/images/images.html', 'app/components/info/info.html', 'app/components/jenkins/jenkins.html', 'app/components/masthead/masthead.html', 'app/components/pullImage/pullImage.html', 'app/components/sidebar/sidebar.html', 'app/components/startContainer/startcontainer.html', 'app/components/stats/stats.html']);

angular.module("app/components/builder/builder.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/builder/builder.html",
    "<div id=\"build-modal\" class=\"modal fade\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\">\n" +
    "            <div class=\"modal-header\">\n" +
    "                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n" +
    "                <h3>Build Image</h3>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body\">\n" +
    "                <div id=\"editor\"></div>\n" +
    "                <p>{{ messages }}</p>\n" +
    "            </div>\n" +
    "            <div class=\"modal-footer\">\n" +
    "                <a href=\"\" class=\"btn btn-primary\" ng-click=\"build()\">Build</a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("app/components/container/container.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/container/container.html",
    "<div class=\"detail\">\n" +
    "\n" +
    "    <div ng-if=\"!container.edit\">\n" +
    "        <h4>Container: {{ container.Name }}\n" +
    "            <button class=\"btn btn-primary\"\n" +
    "                    ng-click=\"container.edit = true;\">Rename\n" +
    "            </button>\n" +
    "        </h4>\n" +
    "    </div>\n" +
    "    <div ng-if=\"container.edit\">\n" +
    "        <h4>\n" +
    "            Container:\n" +
    "            <input type=\"text\" ng-model=\"container.newContainerName\">\n" +
    "            <button class=\"btn btn-success\"\n" +
    "                    ng-click=\"renameContainer()\">Save\n" +
    "            </button>\n" +
    "            <button class=\"btn btn-danger\"\n" +
    "                    ng-click=\"container.edit = false;\">&times;</button>\n" +
    "        </h4>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"btn-group detail\">\n" +
    "        <button class=\"btn btn-success\"\n" +
    "                ng-click=\"start()\"\n" +
    "                ng-show=\"!container.State.Running\">Start\n" +
    "        </button>\n" +
    "        <button class=\"btn btn-warning\"\n" +
    "                ng-click=\"stop()\"\n" +
    "                ng-show=\"container.State.Running && !container.State.Paused\">Stop\n" +
    "        </button>\n" +
    "        <button class=\"btn btn-danger\"\n" +
    "                ng-click=\"kill()\"\n" +
    "                ng-show=\"container.State.Running && !container.State.Paused\">Kill\n" +
    "        </button>\n" +
    "        <button class=\"btn btn-info\"\n" +
    "                ng-click=\"pause()\"\n" +
    "                ng-show=\"container.State.Running && !container.State.Paused\">Pause\n" +
    "        </button>\n" +
    "        <button class=\"btn btn-success\"\n" +
    "                ng-click=\"unpause()\"\n" +
    "                ng-show=\"container.State.Running && container.State.Paused\">Unpause\n" +
    "        </button>\n" +
    "        <button class=\"btn btn-success\"\n" +
    "                ng-click=\"restart()\"\n" +
    "                ng-show=\"container.State.Running && !container.State.Stopped\">Restart\n" +
    "        </button>\n" +
    "        <button class=\"btn btn-primary\"\n" +
    "                ng-click=\"commit()\"\n" +
    "                ng-show=\"container.State.Running && !container.State.Paused\">Commit\n" +
    "        </button>\n" +
    "    </div>\n" +
    "\n" +
    "    <table class=\"table table-striped\">\n" +
    "        <tbody>\n" +
    "        <tr>\n" +
    "            <td>Created:</td>\n" +
    "            <td>{{ container.Created }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Path:</td>\n" +
    "            <td>{{ container.Path }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Args:</td>\n" +
    "            <td>{{ container.Args }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Exposed Ports:</td>\n" +
    "            <td>\n" +
    "                <ul>\n" +
    "                    <li ng-repeat=\"(k, v) in container.Config.ExposedPorts\">{{ k }}</li>\n" +
    "                </ul>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Environment:</td>\n" +
    "            <td>\n" +
    "                <ul>\n" +
    "                    <li ng-repeat=\"k in container.Config.Env\">{{ k }}</li>\n" +
    "                </ul>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "\n" +
    "        <tr>\n" +
    "            <td>Publish All:</td>\n" +
    "            <td>{{ container.HostConfig.PublishAllPorts }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Ports:</td>\n" +
    "            <td>\n" +
    "                <ul style=\"display:inline-table\">\n" +
    "                    <li ng-repeat=\"(containerport, hostports) in container.HostConfig.PortBindings\">\n" +
    "                        {{ containerport }} => <span class=\"label label-default\" ng-repeat=\"(k,v) in hostports\">{{ v.HostIp }}:{{ v.HostPort }}</span>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </td>\n" +
    "\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Hostname:</td>\n" +
    "            <td>{{ container.Config.Hostname }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>IPAddress:</td>\n" +
    "            <td>{{ container.NetworkSettings.IPAddress }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Cmd:</td>\n" +
    "            <td>{{ container.Config.Cmd }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Entrypoint:</td>\n" +
    "            <td>{{ container.Config.Entrypoint }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Volumes:</td>\n" +
    "            <td>{{ container.Volumes }}</td>\n" +
    "        </tr>\n" +
    "\n" +
    "        <tr>\n" +
    "            <td>SysInitpath:</td>\n" +
    "            <td>{{ container.SysInitPath }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Image:</td>\n" +
    "            <td><a href=\"#/images/{{ container.Image }}/\">{{ container.Image }}</a></td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>State:</td>\n" +
    "            <td><span class=\"label {{ container.State|getstatelabel }}\">{{ container.State|getstatetext }}</span></td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Logs:</td>\n" +
    "            <td><a href=\"#/containers/{{ container.Id }}/logs\">stdout/stderr</a></td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Stats:</td>\n" +
    "            <td><a href=\"#/containers/{{ container.Id }}/stats\">stats</a></td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Top:</td>\n" +
    "            <td><a href=\"#/containers/{{ container.Id }}/top\">Top</a></td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "\n" +
    "    <div class=\"row-fluid\">\n" +
    "        <div class=\"span1\">\n" +
    "            Changes:\n" +
    "        </div>\n" +
    "        <div class=\"span5\">\n" +
    "            <i class=\"icon-refresh\" style=\"width:32px;height:32px;\" ng-click=\"getChanges()\"></i>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"well well-large\">\n" +
    "        <ul>\n" +
    "            <li ng-repeat=\"change in changes | filter:hasContent\">\n" +
    "                <strong>{{ change.Path }}</strong> {{ change.Kind }}\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <hr/>\n" +
    "\n" +
    "    <div class=\"btn-remove\">\n" +
    "        <button class=\"btn btn-large btn-block btn-primary btn-danger\" ng-click=\"remove()\">Remove Container</button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("app/components/containerLogs/containerlogs.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/containerLogs/containerlogs.html",
    "<div class=\"row logs\">\n" +
    "    <div class=\"col-xs-12\">\n" +
    "        <h4>Logs for container: <a href=\"#/containers/{{ container.Id }}/\">{{ container.Name }}</a></td></h4>\n" +
    "\n" +
    "        <div class=\"btn-group detail\">\n" +
    "            <button class=\"btn btn-info\" ng-click=\"scrollTo('stdout')\">stdout</button>\n" +
    "            <button class=\"btn btn-warning\" ng-click=\"scrollTo('stderr')\">stderr</button>\n" +
    "        </div>\n" +
    "        <div class=\"pull-right col-xs-6\">\n" +
    "            <div class=\"col-xs-6\">\n" +
    "                <a class=\"btn btn-primary\" ng-click=\"toggleTail()\" role=\"button\">Reload logs</a>\n" +
    "                <input id=\"tailLines\" type=\"number\" ng-style=\"{width: '45px'}\"\n" +
    "                       ng-model=\"tailLines\" ng-keypress=\"($event.which === 13)? toggleTail() : 0\"/>\n" +
    "                <label for=\"tailLines\">lines</label>\n" +
    "            </div>\n" +
    "            <div class=\"col-xs-4\">\n" +
    "                <input id=\"timestampToggle\" type=\"checkbox\" ng-model=\"showTimestamps\"\n" +
    "                       ng-change=\"toggleTimestamps()\"/> <label for=\"timestampToggle\">Timestamps</label>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"col-xs-12\">\n" +
    "        <div class=\"panel panel-default\">\n" +
    "            <div class=\"panel-heading\">\n" +
    "                <h3 id=\"stdout\" class=\"panel-title\">STDOUT</h3>\n" +
    "            </div>\n" +
    "            <div class=\"panel-body\">\n" +
    "                <pre id=\"stdoutLog\" class=\"pre-scrollable pre-x-scrollable\">{{stdout}}</pre>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12\">\n" +
    "        <div class=\"panel panel-default\">\n" +
    "            <div class=\"panel-heading\">\n" +
    "                <h3 id=\"stderr\" class=\"panel-title\">STDERR</h3>\n" +
    "            </div>\n" +
    "            <div class=\"panel-body\">\n" +
    "                <pre id=\"stderrLog\" class=\"pre-scrollable pre-x-scrollable\">{{stderr}}</pre>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("app/components/containerTop/containerTop.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/containerTop/containerTop.html",
    "<div class=\"containerTop\">\n" +
    "    <div class=\"form-group col-xs-2\">\n" +
    "        <input type=\"text\" class=\"form-control\" placeholder=\"[options] (aux)\" ng-model=\"ps_args\">\n" +
    "    </div>\n" +
    "    <button type=\"button\" class=\"btn btn-default\" ng-click=\"getTop()\">Submit</button>\n" +
    "\n" +
    "    <table class=\"table table-striped\">\n" +
    "        <thead>\n" +
    "        <tr>\n" +
    "            <th ng-repeat=\"title in containerTop.Titles\">{{title}}</th>\n" +
    "        </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "        <tr ng-repeat=\"processInfos in containerTop.Processes\">\n" +
    "            <td ng-repeat=\"processInfo in processInfos track by $index\">{{processInfo}}</td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "</div>");
}]);

angular.module("app/components/containers/containers.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/containers/containers.html",
    "\n" +
    "<h2>Containers:</h2>\n" +
    "\n" +
    "<div>\n" +
    "    <ul class=\"nav nav-pills pull-left\">\n" +
    "        <li class=\"dropdown\">\n" +
    "            <a class=\"dropdown-toggle\" id=\"drop4\" role=\"button\" data-toggle=\"dropdown\" data-target=\"#\">Actions <b class=\"caret\"></b></a>\n" +
    "            <ul id=\"menu1\" class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"drop4\">\n" +
    "                <li><a tabindex=\"-1\" href=\"\" ng-click=\"startAction()\">Start</a></li>\n" +
    "                <li><a tabindex=\"-1\" href=\"\" ng-click=\"stopAction()\">Stop</a></li>\n" +
    "                <li><a tabindex=\"-1\" href=\"\" ng-click=\"restartAction()\">Restart</a></li>\n" +
    "                <li><a tabindex=\"-1\" href=\"\" ng-click=\"killAction()\">Kill</a></li>\n" +
    "                <li><a tabindex=\"-1\" href=\"\" ng-click=\"pauseAction()\">Pause</a></li>\n" +
    "                <li><a tabindex=\"-1\" href=\"\" ng-click=\"unpauseAction()\">Unpause</a></li>\n" +
    "                <li><a tabindex=\"-1\" href=\"\" ng-click=\"removeAction()\">Remove</a></li>\n" +
    "            </ul>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <div class=\"pull-right form-inline\">\n" +
    "        <input type=\"checkbox\" ng-model=\"displayAll\" id=\"displayAll\" ng-change=\"toggleGetAll()\"/> <label for=\"displayAll\">Display All</label>&nbsp;\n" +
    "        <input type=\"text\" class=\"form-control\" style=\"vertical-align: center\" id=\"filter\" placeholder=\"Filter\" ng-model=\"filter\"/> <label class=\"sr-only\" for=\"filter\">Filter</label>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<table class=\"table table-striped\">\n" +
    "    <thead>\n" +
    "        <tr>\n" +
    "            <th><input type=\"checkbox\" ng-model=\"toggle\" ng-change=\"toggleSelectAll()\" /> Action</th>\n" +
    "            <th>Name</th>\n" +
    "            <th>Image</th>\n" +
    "            <th>Command</th>\n" +
    "            <th>Created</th>\n" +
    "            <th>Status</th>\n" +
    "        </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"container in containers | filter:filter | orderBy:predicate\">\n" +
    "            <td><input type=\"checkbox\" ng-model=\"container.Checked\" /></td>\n" +
    "            <td><a href=\"#/containers/{{ container.Id }}/\">{{ container|containername}}</a></td>\n" +
    "            <td><a href=\"#/images/{{ container.Image }}/\">{{ container.Image }}</a></td>\n" +
    "            <td>{{ container.Command|truncate:40 }}</td>\n" +
    "            <td>{{ container.Created|getdate }}</td>\n" +
    "            <td><span class=\"label label-{{ container.Status|statusbadge }}\">{{ container.Status }}</span></td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("app/components/containersNetwork/containersNetwork.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/containersNetwork/containersNetwork.html",
    "<div class=\"detail\">\n" +
    "    <h2>Containers Network</h2>\n" +
    "\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"input-group\">\n" +
    "            <input type=\"text\" ng-model=\"query\" autofocus=\"true\" class=\"form-control\"\n" +
    "                   placeholder=\"Search\" ng-change=\"network.selectContainers(query)\"/>\n" +
    "            <span class=\"input-group-addon\"><span class=\"glyphicon glyphicon-search\"/></span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"btn-group\">\n" +
    "            <button class=\"btn btn-warning\" ng-click=\"network.hideSelected()\">Hide Selected</button>\n" +
    "            <button class=\"btn btn-info\" ng-click=\"network.showSelectedDownstream()\">Show Selected Downstream</button>\n" +
    "            <button class=\"btn btn-info\" ng-click=\"network.showSelectedUpstream()\">Show Selected Upstream</button>\n" +
    "            <button class=\"btn btn-success\" ng-click=\"network.showAll()\">Show All</button>\n" +
    "        </div>\n" +
    "        <input type=\"checkbox\" ng-model=\"includeStopped\" id=\"includeStopped\" ng-change=\"toggleIncludeStopped()\"/> <label\n" +
    "            for=\"includeStopped\">Include stopped containers</label>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <vis-network data=\"network.data\" options=\"network.options\" events=\"network.events\"\n" +
    "                     component=\"network.component\"/>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("app/components/dashboard/dashboard.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/dashboard/dashboard.html",
    "<div class=\"col-xs-offset-1\">\n" +
    "    <!--<div class=\"sidebar span4\">\n" +
    "        <div ng-include=\"template\" ng-controller=\"SideBarController\"></div>\n" +
    "    </div>-->\n" +
    "   <!--  <div class=\"row\">\n" +
    "       <div class=\"col-xs-10\" id=\"masthead\" style=\"display:none\">\n" +
    "           <div class=\"jumbotron\">\n" +
    "               <h1>DockerUI</h1>\n" +
    "\n" +
    "               <p class=\"lead\">The Linux container engine</p>\n" +
    "               <a class=\"btn btn-large btn-success\" href=\"http://docker.io\">Learn more.</a>\n" +
    "           </div>\n" +
    "       </div>\n" +
    "   </div> -->\n" +
    "\n" +
    "   <!--  <div class=\"row\">\n" +
    "       <div class=\"col-xs-10\">\n" +
    "           <div class=\"col-xs-5\">\n" +
    "               <h3>Running Containers</h3>\n" +
    "               <ul>\n" +
    "                   <li ng-repeat=\"container in containers|orderBy:predicate\">\n" +
    "                       <a href=\"#/containers/{{ container.Id }}/\">{{ container|containername }}</a>\n" +
    "                       <span class=\"label label-{{ container.Status|statusbadge }}\">{{ container.Status }}</span>\n" +
    "                   </li>\n" +
    "               </ul>\n" +
    "           </div>\n" +
    "           <div class=\"col-xs-5 text-right\">\n" +
    "               <h3>Status</h3>\n" +
    "               <canvas id=\"containers-chart\" class=\"pull-right\">\n" +
    "                   <p class=\"browserupgrade\">You are using an <strong>outdated</strong> browser. Please <a\n" +
    "                           href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>\n" +
    "               </canvas>\n" +
    "               <div id=\"chart-legend\"></div>\n" +
    "           </div>\n" +
    "       </div>\n" +
    "   </div> -->\n" +
    "\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-xs-10\" id=\"stats\">\n" +
    "            <h4>Containers created</h4>\n" +
    "            <canvas id=\"containers-started-chart\" width=\"700\">\n" +
    "                <p class=\"browserupgrade\">You are using an <strong>outdated</strong> browser. Please <a\n" +
    "                        href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>\n" +
    "            </canvas>\n" +
    "            <h4>Images created</h4>\n" +
    "            <canvas id=\"images-created-chart\" width=\"700\">\n" +
    "                <p class=\"browserupgrade\">You are using an <strong>outdated</strong> browser. Please <a\n" +
    "                        href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>\n" +
    "            </canvas>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("app/components/events/events.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/events/events.html",
    "<div class=\"row\">\n" +
    "    <div class=\"col-xs-12\">\n" +
    "        <h2>Events</h2>\n" +
    "\n" +
    "        <form class=\"form-inline\">\n" +
    "            <div class=\"form-group\">\n" +
    "                <label for=\"since\">Since:</label>\n" +
    "                <input id=\"since\" type=\"datetime-local\" ng-model=\"model.since\" class=\"form-control\" step=\"any\"/>\n" +
    "            </div>\n" +
    "            <div class=\"form-group\">\n" +
    "                <label for=\"until\">Until:</label>\n" +
    "                <input id=\"until\" type=\"datetime-local\" ng-model=\"model.until\" class=\"form-control\" step=\"any\"/>\n" +
    "            </div>\n" +
    "            <button ng-click=\"updateEvents()\" class=\"btn btn-primary\">Update</button>\n" +
    "        </form>\n" +
    "        <br>\n" +
    "        <table class=\"table\">\n" +
    "            <tbody>\n" +
    "            <tr>\n" +
    "                <th>Event</th>\n" +
    "                <th>From</th>\n" +
    "                <th>ID</th>\n" +
    "                <th>Time</th>\n" +
    "            </tr>\n" +
    "            <tr ng-repeat=\"event in dockerEvents\">\n" +
    "                <td ng-bind=\"event.status\"/>\n" +
    "                <td ng-bind=\"event.from\"/>\n" +
    "                <td ng-bind=\"event.id\"/>\n" +
    "                <td ng-bind=\"event.time * 1000 | date:'medium'\"/>\n" +
    "            </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("app/components/footer/statusbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/footer/statusbar.html",
    "<footer class=\"center well\">\n" +
    "    <p>\n" +
    "        <strong> CMPE 283 Project, Team 1 2015</strong>\n" +
    "    </p>\n" +
    "</footer>\n" +
    "");
}]);

angular.module("app/components/image/image.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/image/image.html",
    "<div ng-include=\"template\" ng-controller=\"StartContainerController\"></div>\n" +
    "\n" +
    "<div class=\"alert alert-error\" id=\"error-message\" style=\"display:none\">\n" +
    "    {{ error }}\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"detail\">\n" +
    "\n" +
    "    <h4>Image: <strong>{{ tag }}</strong></h4>\n" +
    "<!--\n" +
    "    <div class=\"btn-group detail\">\n" +
    "        <button class=\"btn btn-success\" data-toggle=\"modal\" data-target=\"#create-modal\">Create</button>\n" +
    "    </div> -->\n" +
    "\n" +
    "    <!-- <div>\n" +
    "        <h4>Containers created:</h4>\n" +
    "        <canvas id=\"containers-started-chart\" width=\"750\">\n" +
    "            <p class=\"browserupgrade\">You are using an <strong>outdated</strong> browser. Please <a\n" +
    "                    href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>\n" +
    "        </canvas>\n" +
    "    </div> -->\n" +
    "\n" +
    "    <table class=\"table table-striped\">\n" +
    "        <tbody>\n" +
    "        <tr>\n" +
    "            <td>Created:</td>\n" +
    "            <td>{{ image.Created }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Parent:</td>\n" +
    "            <td><a href=\"#/images/{{ image.Parent }}/\">{{ image.Parent }}</a></td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Size (Virtual Size):</td>\n" +
    "            <td>{{ image.Size|humansize }} ({{ image.VirtualSize|humansize }})</td>\n" +
    "        </tr>\n" +
    "\n" +
    "        <tr>\n" +
    "            <td>Hostname:</td>\n" +
    "            <td>{{ image.ContainerConfig.Hostname }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>User:</td>\n" +
    "            <td>{{ image.ContainerConfig.User }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Cmd:</td>\n" +
    "            <td>{{ image.ContainerConfig.Cmd }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Volumes:</td>\n" +
    "            <td>{{ image.ContainerConfig.Volumes }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Volumes from:</td>\n" +
    "            <td>{{ image.ContainerConfig.VolumesFrom }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Built with:</td>\n" +
    "            <td>Docker {{ image.DockerVersion }} on {{ image.Os}}, {{ image.Architecture }}</td>\n" +
    "        </tr>\n" +
    "\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "\n" +
    "    <div class=\"row-fluid\">\n" +
    "        <div class=\"span1\">\n" +
    "            History:\n" +
    "        </div>\n" +
    "        <div class=\"span5\">\n" +
    "            <i class=\"icon-refresh\" style=\"width:32px;height:32px;\" ng-click=\"getHistory()\"></i>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"well well-large\">\n" +
    "        <ul>\n" +
    "            <li ng-repeat=\"change in history\">\n" +
    "                <strong>{{ change.Id }}</strong>: Created: {{ change.Created|getdate }} Created by: {{ change.CreatedBy\n" +
    "                }}\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- <hr/>\n" +
    "\n" +
    "    <div class=\"row-fluid\">\n" +
    "        <form class=\"form-inline\" role=\"form\">\n" +
    "            <fieldset>\n" +
    "                <legend>Tag image</legend>\n" +
    "                <div class=\"form-group\">\n" +
    "                    <label>Tag:</label>\n" +
    "                    <input type=\"text\" placeholder=\"repo...\" ng-model=\"tag.repo\" class=\"form-control\">\n" +
    "                </div>\n" +
    "                <div class=\"form-group\">\n" +
    "                    <label class=\"checkbox\">\n" +
    "                        <input type=\"checkbox\" ng-model=\"tag.force\" class=\"form-control\"/> Force?\n" +
    "                    </label>\n" +
    "                </div>\n" +
    "                <input type=\"button\" ng-click=\"updateTag()\" value=\"Tag\" class=\"btn btn-primary\"/>\n" +
    "            </fieldset>\n" +
    "        </form>\n" +
    "    </div> -->\n" +
    "\n" +
    "    <hr/>\n" +
    "\n" +
    "    <div class=\"btn-remove\">\n" +
    "        <button class=\"btn btn-large btn-block btn-primary btn-danger\" ng-click=\"remove()\">Remove Image</button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("app/components/images/images.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/images/images.html",
    "    <div ng-include=\"template\" ng-controller=\"BuilderController\"></div>\n" +
    "<div ng-include=\"template\" ng-controller=\"PullImageController\"></div>\n" +
    "\n" +
    "<h2>Images:</h2>\n" +
    "\n" +
    "<div>\n" +
    "    <ul class=\"nav nav-pills pull-left\">\n" +
    "        <li class=\"dropdown\">\n" +
    "            <a class=\"dropdown-toggle\" id=\"drop4\" role=\"button\" data-toggle=\"dropdown\" data-target=\"#\">Actions <b class=\"caret\"></b></a>\n" +
    "            <ul id=\"menu1\" class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"drop4\">\n" +
    "                <li><a tabindex=\"-1\" href=\"\" ng-click=\"removeAction()\">Remove</a></li>\n" +
    "            </ul>\n" +
    "        </li>\n" +
    "        <li><a data-toggle=\"modal\" data-target=\"#pull-modal\" href=\"\">Pull</a></li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <div class=\"pull-right form-inline\">\n" +
    "        <input type=\"text\" class=\"form-control\" id=\"filter\" placeholder=\"Filter\" ng-model=\"filter\"/> <label class=\"sr-only\" for=\"filter\">Filter</label>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<table class=\"table table-striped\">\n" +
    "    <thead>\n" +
    "        <tr>\n" +
    "            <th><input type=\"checkbox\" ng-model=\"toggle\" ng-change=\"toggleSelectAll()\" /> Action</th>\n" +
    "            <th>Id</th>\n" +
    "            <th>Repository</th>\n" +
    "            <th>VirtualSize</th>\n" +
    "            <th>Created</th>\n" +
    "        </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"image in images | filter:filter | orderBy:predicate\">\n" +
    "            <td><input type=\"checkbox\" ng-model=\"image.Checked\" /></td>\n" +
    "            <td><a href=\"#/images/{{ image.Id }}/?tag={{ image|repotag }}\">{{ image.Id|truncate:20}}</a></td>\n" +
    "            <td>{{ image|repotag }}</td>\n" +
    "            <td>{{ image.VirtualSize|humansize }}</td>\n" +
    "            <td>{{ image.Created|getdate }}</td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("app/components/info/info.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/info/info.html",
    "<div class=\"detail\">\n" +
    "    <h2>Docker Information</h2>\n" +
    "\n" +
    "    <table class=\"table table-striped\">\n" +
    "        <tbody>\n" +
    "        <tr>\n" +
    "            <td>API Endpoint:</td>\n" +
    "            <td>{{ endpoint }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Docker version:</td>\n" +
    "            <td>{{ docker.Version }}</td>\n" +
    "        </tr>\n" +
    "        <!-- <tr>\n" +
    "            <td>Go Version:</td>\n" +
    "            <td>{{ docker.GoVersion }}</td>\n" +
    "        </tr> -->\n" +
    "        <tr>\n" +
    "            <td>Containers:</td>\n" +
    "            <td>{{ info.Containers }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Images:</td>\n" +
    "            <td>{{ info.Images }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Debug:</td>\n" +
    "            <td>{{ info.Debug }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>CPUs:</td>\n" +
    "            <td>{{ info.NCPU }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Total Memory:</td>\n" +
    "            <td>{{ info.MemTotal|humansize }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Operating System:</td>\n" +
    "            <td>{{ info.OperatingSystem }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Kernel Version:</td>\n" +
    "            <td>{{ info.KernelVersion }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>IPv4 Forwarding:</td>\n" +
    "            <td>{{ info.IPv4Forwarding }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Docker Root Directory:</td>\n" +
    "            <td>{{ info.DockerRootDir }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Memory Limit:</td>\n" +
    "            <td>{{ info.MemoryLimit }}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td>Swap Limit:</td>\n" +
    "            <td>{{ info.SwapLimit }}</td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "</div>\n" +
    "");
}]);

angular.module("app/components/jenkins/jenkins.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/jenkins/jenkins.html",
    "<div id=\"view\" class=\"ng-scope\">\n" +
    "<div class=\"detail\">\n" +
    "    <h2> Jenkin Jobs:</h2>\n" +
    "\n" +
    "    <table class=\"table table-striped\">\n" +
    "        <thead>\n" +
    "        <tr>\n" +
    "            <th>Jobs</th>\n" +
    "            <th>Status</th>\n" +
    "            <th>Details</th>\n" +
    "        </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "        <tr>\n" +
    "            <td>{{ job.name }}</td>\n" +
    "            <td>{{ job.color}}</td>\n" +
    "            <td><a href=\"http://ec2-54-183-209-118.us-west-1.compute.amazonaws.com:8080/api/json?pretty=true\">{{ job.url }}</a></td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("app/components/masthead/masthead.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/masthead/masthead.html",
    "<div class=\"masthead\">\n" +
    "    <h3 class=\"text-muted\">Control Panel </h3>\n" +
    "    <ul class=\"nav well\">\n" +
    "        <li><a href=\"#/\">Dashboard</a></li>\n" +
    "        <li><a href=\"#/containers/\">Containers</a></li>\n" +
    "        <li><a href=\"#/images/\">Images</a></li>\n" +
    "         <li><a href=\"#/events/\">Events</a></li>\n" +
    "         <li><a href=\"#/info/\">System Info</a></li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("app/components/pullImage/pullImage.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/pullImage/pullImage.html",
    "<div id=\"pull-modal\" class=\"modal fade\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\">\n" +
    "            <div class=\"modal-header\">\n" +
    "                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n" +
    "                <h3>Pull Image</h3>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body\">\n" +
    "                <form novalidate role=\"form\" name=\"pullForm\">\n" +
    "                    <!--<div class=\"input-group\">\n" +
    "                        <span class=\"input-group-addon\" id=\"basic-addon1\">Image name</span>\n" +
    "                        <input type=\"text\" class=\"form-control\" placeholder=\"imageName\" aria-describedby=\"basic-addon1\">\n" +
    "                    </div>-->\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label>Registry:</label>\n" +
    "                        <input type=\"text\" ng-model=\"config.registry\" class=\"form-control\"\n" +
    "                               placeholder=\"Registry. Leave empty to user docker hub\"/>\n" +
    "                    </div>\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label>Repo:</label>\n" +
    "                        <input type=\"text\" ng-model=\"config.repo\" class=\"form-control\"\n" +
    "                               placeholder=\"Repository - usually your username.\"/>\n" +
    "                    </div>\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label>Image Name:</label>\n" +
    "                        <input type=\"text\" ng-model=\"config.fromImage\" class=\"form-control\" placeholder=\"Image name\"\n" +
    "                               required/>\n" +
    "                    </div>\n" +
    "                    <div class=\"form-group\">\n" +
    "                        <label>Tag Name:</label>\n" +
    "                        <input type=\"text\" ng-model=\"config.tag\" class=\"form-control\"\n" +
    "                               placeholder=\"Tag name. If empty it will download ALL tags.\"/>\n" +
    "                    </div>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "            <div class=\"alert alert-error\" id=\"error-message\" style=\"display:none\">\n" +
    "                {{ error }}\n" +
    "            </div>\n" +
    "            <div class=\"modal-footer\">\n" +
    "                <a href=\"\" class=\"btn btn-primary\" ng-click=\"pull()\">Pull</a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("app/components/sidebar/sidebar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/sidebar/sidebar.html",
    "<div class=\"well\">\n" +
    "    <strong>Running containers:</strong>\n" +
    "    <br/>\n" +
    "    <strong>Endpoint: </strong>{{ endpoint }}\n" +
    "    <ul>\n" +
    "        <li ng-repeat=\"container in containers\">\n" +
    "            <a href=\"#/containers/{{ container.Id }}/\">{{ container.Id|truncate:20 }}</a>\n" +
    "            <span class=\"pull-right label label-{{ container.Status|statusbadge }}\">{{ container.Status }}</span>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div> \n" +
    "");
}]);

angular.module("app/components/startContainer/startcontainer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/startContainer/startcontainer.html",
    "<div id=\"create-modal\" class=\"modal fade\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\">\n" +
    "            <div class=\"modal-header\">\n" +
    "                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n" +
    "                <h3>Create And Start Container From Image</h3>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body\">\n" +
    "                <form role=\"form\">\n" +
    "                    <accordion close-others=\"true\">\n" +
    "                        <accordion-group heading=\"Container options\" is-open=\"menuStatus.containerOpen\">\n" +
    "                            <fieldset>\n" +
    "                                <div class=\"row\">\n" +
    "                                    <div class=\"col-xs-6\">\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Cmd:</label>\n" +
    "                                            <input type=\"text\" placeholder='[\"/bin/echo\", \"Hello world\"]'\n" +
    "                                                   ng-model=\"config.Cmd\" class=\"form-control\"/>\n" +
    "                                            <small>Input commands as a raw string or JSON array</small>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Entrypoint:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"config.Entrypoint\" class=\"form-control\"\n" +
    "                                                   placeholder=\"./entrypoint.sh\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Name:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"config.name\" class=\"form-control\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Hostname:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"config.Hostname\" class=\"form-control\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Domainname:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"config.Domainname\" class=\"form-control\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>User:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"config.User\" class=\"form-control\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Memory:</label>\n" +
    "                                            <input type=\"number\" ng-model=\"config.Memory\" class=\"form-control\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Volumes:</label>\n" +
    "\n" +
    "                                            <div ng-repeat=\"volume in config.Volumes\">\n" +
    "                                                <div class=\"form-group form-inline\">\n" +
    "                                                    <input type=\"text\" ng-model=\"volume.name\" class=\"form-control\"\n" +
    "                                                           placeholder=\"/var/data\"/>\n" +
    "                                                    <button type=\"button\" class=\"btn btn-danger btn-sm\"\n" +
    "                                                            ng-click=\"rmEntry(config.Volumes, volume)\">Remove\n" +
    "                                                    </button>\n" +
    "                                                </div>\n" +
    "                                            </div>\n" +
    "                                            <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                                    ng-click=\"addEntry(config.Volumes, {name: ''})\">Add Volume\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                    <div class=\"col-xs-6\">\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>MemorySwap:</label>\n" +
    "                                            <input type=\"number\" ng-model=\"config.MemorySwap\" class=\"form-control\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>CpuShares:</label>\n" +
    "                                            <input type=\"number\" ng-model=\"config.CpuShares\" class=\"form-control\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Cpuset:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"config.Cpuset\" class=\"form-control\"\n" +
    "                                                   placeholder=\"1,2\"/>\n" +
    "                                            <small>Input as comma-separated list of numbers</small>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>WorkingDir:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"config.WorkingDir\" class=\"form-control\"\n" +
    "                                                   placeholder=\"/app\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>MacAddress:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"config.MacAddress\" class=\"form-control\"\n" +
    "                                                   placeholder=\"12:34:56:78:9a:bc\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label for=\"networkDisabled\">NetworkDisabled:</label>\n" +
    "                                            <input id=\"networkDisabled\" type=\"checkbox\"\n" +
    "                                                   ng-model=\"config.NetworkDisabled\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label for=\"tty\">Tty:</label>\n" +
    "                                            <input id=\"tty\" type=\"checkbox\" ng-model=\"config.Tty\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label for=\"openStdin\">OpenStdin:</label>\n" +
    "                                            <input id=\"openStdin\" type=\"checkbox\" ng-model=\"config.OpenStdin\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label for=\"stdinOnce\">StdinOnce:</label>\n" +
    "                                            <input id=\"stdinOnce\" type=\"checkbox\" ng-model=\"config.StdinOnce\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>SecurityOpts:</label>\n" +
    "\n" +
    "                                            <div ng-repeat=\"opt in config.SecurityOpts\">\n" +
    "                                                <div class=\"form-group form-inline\">\n" +
    "                                                    <input type=\"text\" ng-model=\"opt.name\" class=\"form-control\"\n" +
    "                                                           placeholder=\"label:type:svirt_apache\"/>\n" +
    "                                                    <button type=\"button\" class=\"btn btn-danger btn-sm\"\n" +
    "                                                            ng-click=\"rmEntry(config.SecurityOpts, opt)\">Remove\n" +
    "                                                    </button>\n" +
    "                                                </div>\n" +
    "                                            </div>\n" +
    "                                            <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                                    ng-click=\"addEntry(config.SecurityOpts, {name: ''})\">Add Option\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                                <hr>\n" +
    "                                <div class=\"form-group\">\n" +
    "                                    <label>Env:</label>\n" +
    "\n" +
    "                                    <div ng-repeat=\"envar in config.Env\">\n" +
    "                                        <div class=\"form-group form-inline\">\n" +
    "                                            <div class=\"form-group\">\n" +
    "                                                <label class=\"sr-only\">Variable Name:</label>\n" +
    "                                                <input type=\"text\" ng-model=\"envar.name\" class=\"form-control\"\n" +
    "                                                       placeholder=\"NAME\"/>\n" +
    "                                            </div>\n" +
    "                                            <div class=\"form-group\">\n" +
    "                                                <label class=\"sr-only\">Variable Value:</label>\n" +
    "                                                <input type=\"text\" ng-model=\"envar.value\" class=\"form-control\"\n" +
    "                                                       placeholder=\"value\"/>\n" +
    "                                            </div>\n" +
    "                                            <div class=\"form-group\">\n" +
    "                                                <button class=\"btn btn-danger btn-xs form-control\"\n" +
    "                                                        ng-click=\"rmEntry(config.Env, envar)\">Remove\n" +
    "                                                </button>\n" +
    "                                            </div>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                    <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                            ng-click=\"addEntry(config.Env, {name: '', value: ''})\">Add environment\n" +
    "                                        variable\n" +
    "                                    </button>\n" +
    "                                </div>\n" +
    "                            </fieldset>\n" +
    "                        </accordion-group>\n" +
    "                        <accordion-group heading=\"HostConfig options\" is-open=\"menuStatus.hostConfigOpen\">\n" +
    "                            <fieldset>\n" +
    "                                <div class=\"row\">\n" +
    "                                    <div class=\"col-xs-6\">\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Binds:</label>\n" +
    "\n" +
    "                                            <div ng-repeat=\"bind in config.HostConfig.Binds\">\n" +
    "                                                <div class=\"form-group form-inline\">\n" +
    "                                                    <input type=\"text\" ng-model=\"bind.name\" class=\"form-control\"\n" +
    "                                                           placeholder=\"/host:/container\"/>\n" +
    "                                                    <button type=\"button\" class=\"btn btn-danger btn-sm\"\n" +
    "                                                            ng-click=\"rmEntry(config.HostConfig.Binds, bind)\">Remove\n" +
    "                                                    </button>\n" +
    "                                                </div>\n" +
    "                                            </div>\n" +
    "                                            <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                                    ng-click=\"addEntry(config.HostConfig.Binds, {name: ''})\">Add Bind\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Links:</label>\n" +
    "\n" +
    "                                            <div ng-repeat=\"link in config.HostConfig.Links\">\n" +
    "                                                <div class=\"form-group form-inline\">\n" +
    "                                                    <input type=\"text\" ng-model=\"link.name\" class=\"form-control\"\n" +
    "                                                           placeholder=\"web:db\">\n" +
    "                                                    <button type=\"button\" class=\"btn btn-danger btn-sm\"\n" +
    "                                                            ng-click=\"rmEntry(config.HostConfig.Links, link)\">Remove\n" +
    "                                                    </button>\n" +
    "                                                </div>\n" +
    "                                            </div>\n" +
    "                                            <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                                    ng-click=\"addEntry(config.HostConfig.Links, {name: ''})\">Add Link\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>Dns:</label>\n" +
    "\n" +
    "                                            <div ng-repeat=\"entry in config.HostConfig.Dns\">\n" +
    "                                                <div class=\"form-group form-inline\">\n" +
    "                                                    <input type=\"text\" ng-model=\"entry.name\" class=\"form-control\"\n" +
    "                                                           placeholder=\"8.8.8.8\"/>\n" +
    "                                                    <button type=\"button\" class=\"btn btn-danger btn-sm\"\n" +
    "                                                            ng-click=\"rmEntry(config.HostConfig.Dns, entry)\">Remove\n" +
    "                                                    </button>\n" +
    "                                                </div>\n" +
    "                                            </div>\n" +
    "                                            <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                                    ng-click=\"addEntry(config.HostConfig.Dns, {name: ''})\">Add entry\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>DnsSearch:</label>\n" +
    "\n" +
    "                                            <div ng-repeat=\"entry in config.HostConfig.DnsSearch\">\n" +
    "                                                <div class=\"form-group form-inline\">\n" +
    "                                                    <input type=\"text\" ng-model=\"entry.name\" class=\"form-control\"\n" +
    "                                                           placeholder=\"example.com\"/>\n" +
    "                                                    <button type=\"button\" class=\"btn btn-danger btn-sm\"\n" +
    "                                                            ng-click=\"rmEntry(config.HostConfig.DnsSearch, entry)\">\n" +
    "                                                        Remove\n" +
    "                                                    </button>\n" +
    "                                                </div>\n" +
    "                                            </div>\n" +
    "                                            <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                                    ng-click=\"addEntry(config.HostConfig.DnsSearch, {name: ''})\">Add\n" +
    "                                                entry\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>CapAdd:</label>\n" +
    "\n" +
    "                                            <div ng-repeat=\"entry in config.HostConfig.CapAdd\">\n" +
    "                                                <div class=\"form-group form-inline\">\n" +
    "                                                    <input type=\"text\" ng-model=\"entry.name\" class=\"form-control\"\n" +
    "                                                           placeholder=\"cap_sys_admin\"/>\n" +
    "                                                    <button type=\"button\" class=\"btn btn-danger btn-sm\"\n" +
    "                                                            ng-click=\"rmEntry(config.HostConfig.CapAdd, entry)\">Remove\n" +
    "                                                    </button>\n" +
    "                                                </div>\n" +
    "                                            </div>\n" +
    "                                            <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                                    ng-click=\"addEntry(config.HostConfig.CapAdd, {name: ''})\">Add entry\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>CapDrop:</label>\n" +
    "\n" +
    "                                            <div ng-repeat=\"entry in config.HostConfig.CapDrop\">\n" +
    "                                                <div class=\"form-group form-inline\">\n" +
    "                                                    <input type=\"text\" ng-model=\"entry.name\" class=\"form-control\"\n" +
    "                                                           placeholder=\"cap_sys_admin\"/>\n" +
    "                                                    <button type=\"button\" class=\"btn btn-danger btn-sm\"\n" +
    "                                                            ng-click=\"rmEntry(config.HostConfig.CapDrop, entry)\">Remove\n" +
    "                                                    </button>\n" +
    "                                                </div>\n" +
    "                                            </div>\n" +
    "                                            <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                                    ng-click=\"addEntry(config.HostConfig.CapDrop, {name: ''})\">Add entry\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                    <div class=\"col-xs-6\">\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>NetworkMode:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"config.HostConfig.NetworkMode\"\n" +
    "                                                   class=\"form-control\" placeholder=\"bridge\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label for=\"publishAllPorts\">PublishAllPorts:</label>\n" +
    "                                            <input id=\"publishAllPorts\" type=\"checkbox\"\n" +
    "                                                   ng-model=\"config.HostConfig.PublishAllPorts\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label for=\"privileged\">Privileged:</label>\n" +
    "                                            <input id=\"privileged\" type=\"checkbox\"\n" +
    "                                                   ng-model=\"config.HostConfig.Privileged\"/>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>VolumesFrom:</label>\n" +
    "\n" +
    "                                            <div ng-repeat=\"volume in config.HostConfig.VolumesFrom\">\n" +
    "                                                <div class=\"form-group form-inline\">\n" +
    "                                                    <select ng-model=\"volume.name\"\n" +
    "                                                            ng-options=\"name for name in containerNames track by name\"\n" +
    "                                                            class=\"form-control\">\n" +
    "                                                    </select>\n" +
    "                                                    <button class=\"btn btn-danger btn-xs form-control\"\n" +
    "                                                            ng-click=\"rmEntry(config.HostConfig.VolumesFrom, volume)\">\n" +
    "                                                        Remove\n" +
    "                                                    </button>\n" +
    "                                                </div>\n" +
    "                                            </div>\n" +
    "                                            <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                                    ng-click=\"addEntry(config.HostConfig.VolumesFrom, {name: ''})\">Add\n" +
    "                                                volume\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "\n" +
    "                                        <div class=\"form-group\">\n" +
    "                                            <label>RestartPolicy:</label>\n" +
    "                                            <select ng-model=\"config.HostConfig.RestartPolicy.name\">\n" +
    "                                                <option value=\"\">disabled</option>\n" +
    "                                                <option value=\"always\">always</option>\n" +
    "                                                <option value=\"on-failure\">on-failure</option>\n" +
    "                                            </select>\n" +
    "                                            <label>MaximumRetryCount:</label>\n" +
    "                                            <input type=\"number\"\n" +
    "                                                   ng-model=\"config.HostConfig.RestartPolicy.MaximumRetryCount\"/>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                                <hr>\n" +
    "                                <div class=\"form-group\">\n" +
    "                                    <label>ExtraHosts:</label>\n" +
    "\n" +
    "                                    <div ng-repeat=\"entry in config.HostConfig.ExtraHosts\">\n" +
    "                                        <div class=\"form-group form-inline\">\n" +
    "                                            <div class=\"form-group\">\n" +
    "                                                <label class=\"sr-only\">Hostname:</label>\n" +
    "                                                <input type=\"text\" ng-model=\"entry.host\" class=\"form-control\"\n" +
    "                                                       placeholder=\"hostname\"/>\n" +
    "                                            </div>\n" +
    "                                            <div class=\"form-group\">\n" +
    "                                                <label class=\"sr-only\">IP Address:</label>\n" +
    "                                                <input type=\"text\" ng-model=\"entry.ip\" class=\"form-control\"\n" +
    "                                                       placeholder=\"127.0.0.1\"/>\n" +
    "                                            </div>\n" +
    "                                            <div class=\"form-group\">\n" +
    "                                                <button class=\"btn btn-danger btn-xs form-control\"\n" +
    "                                                        ng-click=\"rmEntry(config.HostConfig.ExtraHosts, entry)\">Remove\n" +
    "                                                </button>\n" +
    "                                            </div>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                    <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                            ng-click=\"addEntry(config.HostConfig.ExtraHosts, {host: '', ip: ''})\">Add\n" +
    "                                        extra host\n" +
    "                                    </button>\n" +
    "                                </div>\n" +
    "                                <div class=\"form-group\">\n" +
    "                                    <label>LxcConf:</label>\n" +
    "\n" +
    "                                    <div ng-repeat=\"entry in config.HostConfig.LxcConf\">\n" +
    "                                        <div class=\"form-group form-inline\">\n" +
    "                                            <div class=\"form-group\">\n" +
    "                                                <label class=\"sr-only\">Name:</label>\n" +
    "                                                <input type=\"text\" ng-model=\"entry.name\" class=\"form-control\"\n" +
    "                                                       placeholder=\"lxc.utsname\"/>\n" +
    "                                            </div>\n" +
    "                                            <div class=\"form-group\">\n" +
    "                                                <label class=\"sr-only\">Value:</label>\n" +
    "                                                <input type=\"text\" ng-model=\"entry.value\" class=\"form-control\"\n" +
    "                                                       placeholder=\"docker\"/>\n" +
    "                                            </div>\n" +
    "                                            <div class=\"form-group\">\n" +
    "                                                <button class=\"btn btn-danger btn-xs form-control\"\n" +
    "                                                        ng-click=\"rmEntry(config.HostConfig.LxcConf, entry)\">Remove\n" +
    "                                                </button>\n" +
    "                                            </div>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                    <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                            ng-click=\"addEntry(config.HostConfig.LxcConf, {name: '', value: ''})\">Add\n" +
    "                                        Entry\n" +
    "                                    </button>\n" +
    "                                </div>\n" +
    "                                <div class=\"form-group\">\n" +
    "                                    <label>Devices:</label>\n" +
    "\n" +
    "                                    <div ng-repeat=\"device in config.HostConfig.Devices\">\n" +
    "                                        <div class=\"form-group form-inline inline-four\">\n" +
    "                                            <label class=\"sr-only\">PathOnHost:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"device.PathOnHost\" class=\"form-control\"\n" +
    "                                                   placeholder=\"PathOnHost\"/>\n" +
    "                                            <label class=\"sr-only\">PathInContainer:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"device.PathInContainer\" class=\"form-control\"\n" +
    "                                                   placeholder=\"PathInContainer\"/>\n" +
    "                                            <label class=\"sr-only\">CgroupPermissions:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"device.CgroupPermissions\" class=\"form-control\"\n" +
    "                                                   placeholder=\"CgroupPermissions\"/>\n" +
    "                                            <button class=\"btn btn-danger btn-xs form-control\"\n" +
    "                                                    ng-click=\"rmEntry(config.HostConfig.Devices, device)\">Remove\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                    <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                            ng-click=\"addEntry(config.HostConfig.Devices, { PathOnHost: '', PathInContainer: '', CgroupPermissions: ''})\">\n" +
    "                                        Add Device\n" +
    "                                    </button>\n" +
    "                                </div>\n" +
    "                                <div class=\"form-group\">\n" +
    "                                    <label>PortBindings:</label>\n" +
    "\n" +
    "                                    <div ng-repeat=\"portBinding in config.HostConfig.PortBindings\">\n" +
    "                                        <div class=\"form-group form-inline inline-four\">\n" +
    "                                            <label class=\"sr-only\">Host IP:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"portBinding.ip\" class=\"form-control\"\n" +
    "                                                   placeholder=\"Host IP Address\"/>\n" +
    "                                            <label class=\"sr-only\">Host Port:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"portBinding.extPort\" class=\"form-control\"\n" +
    "                                                   placeholder=\"Host Port\"/>\n" +
    "                                            <label class=\"sr-only\">Container port:</label>\n" +
    "                                            <input type=\"text\" ng-model=\"portBinding.intPort\" class=\"form-control\"\n" +
    "                                                   placeholder=\"Container Port\"/>\n" +
    "                                            <select ng-model=\"portBinding.protocol\">\n" +
    "                                                <option value=\"\">tcp</option>\n" +
    "                                                <option value=\"udp\">udp</option>\n" +
    "                                            </select>\n" +
    "                                            <button class=\"btn btn-danger btn-xs form-control\"\n" +
    "                                                    ng-click=\"rmEntry(config.HostConfig.PortBindings, portBinding)\">\n" +
    "                                                Remove\n" +
    "                                            </button>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                    <button type=\"button\" class=\"btn btn-success btn-sm\"\n" +
    "                                            ng-click=\"addEntry(config.HostConfig.PortBindings, {ip: '', extPort: '', intPort: ''})\">\n" +
    "                                        Add Port Binding\n" +
    "                                    </button>\n" +
    "                                </div>\n" +
    "                            </fieldset>\n" +
    "                        </accordion-group>\n" +
    "                    </accordion>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "            <div class=\"modal-footer\">\n" +
    "                <a href=\"\" class=\"btn btn-primary btn-lg\" ng-click=\"create()\">Create</a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("app/components/stats/stats.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("app/components/stats/stats.html",
    "<div class=\"row\">\n" +
    "    <div class=\"col-xs-12\">\n" +
    "        <h1>Stats</h1>\n" +
    "\n" +
    "        <h2>CPU</h2>\n" +
    "\n" +
    "        <div class=\"row\">\n" +
    "            <div class=\"col-sm-7\">\n" +
    "                <canvas id=\"cpu-stats-chart\" width=\"650\" height=\"300\"></canvas>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <h2>Memory</h2>\n" +
    "\n" +
    "        <div class=\"row\">\n" +
    "            <div class=\"col-sm-7\">\n" +
    "                <canvas id=\"memory-stats-chart\" width=\"650\" height=\"300\"></canvas>\n" +
    "            </div>\n" +
    "            <div class=\"col-sm-offset-1 col-sm-4\">\n" +
    "                <table class=\"table\">\n" +
    "                    <tr>\n" +
    "                        <td>Max usage</td>\n" +
    "                        <td>{{ data.memory_stats.max_usage | humansize }}</td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Limit</td>\n" +
    "                        <td>{{ data.memory_stats.limit | humansize }}</td>\n" +
    "                    </tr>\n" +
    "                    <tr>\n" +
    "                        <td>Fail count</td>\n" +
    "                        <td>{{ data.memory_stats.failcnt }}</td>\n" +
    "                    </tr>\n" +
    "                </table>\n" +
    "                <accordion>\n" +
    "                    <accordion-group heading=\"Other stats\">\n" +
    "                        <table class=\"table\">\n" +
    "                            <tr ng-repeat=\"(key, value) in data.memory_stats.stats\">\n" +
    "                                <td>{{ key }}</td>\n" +
    "                                <td>{{ value }}</td>\n" +
    "                            </tr>\n" +
    "                        </table>\n" +
    "                    </accordion-group>\n" +
    "                </accordion>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <h1>Network</h1>\n" +
    "        <div class=\"row\">\n" +
    "            <div class=\"col-sm-7\">\n" +
    "                <canvas id=\"network-stats-chart\" width=\"650\" height=\"300\"></canvas>\n" +
    "            </div>\n" +
    "            <div class=\"col-sm-offset-1 col-sm-4\">\n" +
    "                <div id=\"network-legend\" style=\"margin-bottom: 20px;\"></div>\n" +
    "                <accordion>\n" +
    "                    <accordion-group heading=\"Other stats\">\n" +
    "                        <table class=\"table\">\n" +
    "                            <tr ng-repeat=\"(key, value) in data.network\">\n" +
    "                                <td>{{ key }}</td>\n" +
    "                                <td>{{ value }}</td>\n" +
    "                            </tr>\n" +
    "                        </table>\n" +
    "                    </accordion-group>\n" +
    "                </accordion>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);